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
  if (type === 'txt') {
    return await file.text()
  }
  if (type === 'image') {
    return `[Image file: ${file.name}. Visual content stored for reference.]`
  }
  if (type === 'video') {
    return `[Video file: ${file.name}. Video content stored for reference.]`
  }
  // For PDF, DOCX, XLSX, PPTX — extract raw text via buffer
  // Basic extraction: read as text and clean up binary artifacts
  try {
    const text = await file.text()
    // Strip binary/non-printable characters
    const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
    if (cleaned.length > 100) return cleaned.slice(0, 50000)
    return `[${type.toUpperCase()} file: ${file.name}. Content indexed.]`
  } catch {
    return `[File: ${file.name}. Type: ${type}. Content stored.]`
  }
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
    await supabaseAdmin.from('knowledge_chunks').insert(chunkInserts)
  }

  // Mark as ready
  await supabaseAdmin
    .from('knowledge_sources')
    .update({ status: 'ready' })
    .eq('id', source.id)

  return NextResponse.json({ success: true, sourceId: source.id })
}