import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    pdf: 'pdf', docx: 'docx', doc: 'docx',
    xlsx: 'xlsx', xls: 'xlsx',
    pptx: 'pptx', ppt: 'pptx',
    txt: 'txt', md: 'txt',
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
    mp4: 'video', mov: 'video', avi: 'video',
  }
  return map[ext] || 'file'
}

async function extractText(file: File, type: string): Promise<string> {
  if (type === 'image') {
    return `[Image file: ${file.name}. Visual content stored for reference.]`
  }
  if (type === 'video') {
    return `[Video file: ${file.name}. Video content stored for reference.]`
  }
  if (type === 'txt') {
    const text = await file.text()
    return cleanText(text).slice(0, 50000)
  }
  // PDF, DOCX, XLSX, PPTX — attempt text extraction
  try {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    // Extract only printable ASCII characters from binary
    let extracted = ''
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      // Keep printable ASCII (32-126) and common whitespace
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
        extracted += String.fromCharCode(byte)
      } else {
        extracted += ' '
      }
    }
    const cleaned = cleanText(extracted)
    // Only use if we got meaningful text (at least 100 real characters)
    if (cleaned.replace(/\s/g, '').length > 100) {
      return cleaned.slice(0, 50000)
    }
    return `[${type.toUpperCase()} file: ${file.name}. File stored. Content extraction limited for binary format.]`
  } catch {
    return `[${type.toUpperCase()} file: ${file.name}. Stored in Khemet Brain.]`
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\x00/g, '')           // Remove null bytes
    .replace(/[\x01-\x08]/g, '')    // Remove control characters
    .replace(/[\x0B\x0C]/g, ' ')    // Replace vertical tab, form feed
    .replace(/[\x0E-\x1F]/g, '')    // Remove other control chars
    .replace(/[\x7F-\x9F]/g, '')    // Remove DEL and C1 controls
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .trim()
}

function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap
    if (start >= text.length) break
  }
  return chunks
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const fileType = getFileType(file.name)
  const filePath = `${user.id}/${Date.now()}-${file.name}`

  // Upload to Supabase Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('khemet-brain')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Create knowledge source record
  const { data: source, error: sourceError } = await supabaseAdmin
    .from('knowledge_sources')
    .insert({
      user_id: user.id,
      name: file.name,
      type: fileType,
      file_path: filePath,
      file_size: file.size,
      status: 'processing',
    })
    .select()
    .single()

  if (sourceError || !source) {
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
  }

  // Extract text and chunk it
  const text = await extractText(file, fileType)
  const chunks = chunkText(text)

  // Store chunks
  const chunkInserts = chunks.map((content, index) => ({
    source_id: source.id,
    user_id: user.id,
    content,
    chunk_index: index,
  }))

  if (chunkInserts.length > 0) {
    try {
      // Insert chunks in batches of 10 to avoid size limits
      const batchSize = 10
      for (let i = 0; i < chunkInserts.length; i += batchSize) {
        const batch = chunkInserts.slice(i, i + batchSize)
        const { error: chunkError } = await supabaseAdmin
          .from('knowledge_chunks')
          .insert(batch)
        if (chunkError) {
          console.error('Chunk insert error:', chunkError.message)
        }
      }
    } catch (err) {
      console.error('Chunk insertion failed:', err)
      // Continue — mark source as ready even if chunking partially failed
    }
  }

  // Always mark as ready regardless of chunk outcome
  await supabaseAdmin
    .from('knowledge_sources')
    .update({ status: 'ready' })
    .eq('id', source.id)

  return NextResponse.json({ success: true, sourceId: source.id })
}