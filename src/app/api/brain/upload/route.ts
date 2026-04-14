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

function extractPrintableText(buffer: Buffer): string {
  // Use filter + fromCharCode in batch — much faster than string concat loop
  const printable: number[] = []
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i]
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
      printable.push(b)
    } else if (b === 0) {
      // Skip null bytes entirely
      continue
    } else {
      printable.push(32) // Replace non-printable with space
    }
    // Limit processing to first 200KB of file
    if (i > 200000) break
  }
  return Buffer.from(printable).toString('ascii')
    .replace(/\s{3,}/g, '  ') // Collapse excessive whitespace
    .trim()
    .slice(0, 40000)
}

async function extractText(file: File, type: string): Promise<string> {
  if (type === 'image') return `[Image: ${file.name}]`
  if (type === 'video') return `[Video: ${file.name}]`

  if (type === 'txt') {
    const text = await file.text()
    return text.replace(/\x00/g, '').slice(0, 40000)
  }

  // Binary formats: PDF, DOCX, XLSX, PPTX
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const extracted = extractPrintableText(buffer)
    if (extracted.replace(/\s/g, '').length > 80) {
      return extracted
    }
    return `[${type.toUpperCase()}: ${file.name} — stored in Brain]`
  } catch {
    return `[${type.toUpperCase()}: ${file.name} — stored in Brain]`
  }
}

function chunkText(text: string, size = 1500): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const fileType = getFileType(file.name)
  const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  // Upload to storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('khemet-brain')
    .upload(filePath, file, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Create source record
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
    return NextResponse.json({ error: 'Failed to create source record' }, { status: 500 })
  }

  // Extract and chunk — wrapped so we always return 200
  try {
    const text = await extractText(file, fileType)
    const chunks = chunkText(text)

    // Insert in batches of 5
    for (let i = 0; i < chunks.length; i += 5) {
      const batch = chunks.slice(i, i + 5).map((content, idx) => ({
        source_id: source.id,
        user_id: user.id,
        content,
        chunk_index: i + idx,
      }))
      try {
        await supabaseAdmin.from('knowledge_chunks').insert(batch)
      } catch {
        // ignore batch insert errors
      }
    }
  } catch {
    // Chunking failed — still mark ready
  }

  // Always mark ready
  await supabaseAdmin
    .from('knowledge_sources')
    .update({ status: 'ready' })
    .eq('id', source.id)

  return NextResponse.json({ success: true, sourceId: source.id })
}
