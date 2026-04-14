export const runtime = 'nodejs'

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
    png: 'image', jpg: 'image', jpeg: 'image',
    gif: 'image', webp: 'image',
    mp4: 'video', mov: 'video', avi: 'video',
  }
  return map[ext] || 'file'
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
}

async function extractText(file: File, type: string): Promise<string> {
  if (type === 'image') return `[Image: ${file.name}]`
  if (type === 'video') return `[Video: ${file.name}]`
  if (type === 'txt' || type === 'md') {
    try {
      const text = await file.text()
      return text.replace(/\x00/g, '').slice(0, 30000)
    } catch {
      return `[TXT: ${file.name}]`
    }
  }
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    const chars: string[] = []
    const limit = Math.min(uint8.length, 150000)
    for (let i = 0; i < limit; i++) {
      const b = uint8[i]
      if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
        chars.push(String.fromCharCode(b))
      }
    }
    const extracted = chars.join('').replace(/\s{4,}/g, '   ').trim().slice(0, 30000)
    if (extracted.replace(/\s/g, '').length > 80) return extracted
  } catch { }
  return `[${type.toUpperCase()}: ${file.name} stored in Khemet Brain]`
}

function chunkText(text: string, size = 1500): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size))
  return chunks
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try { formData = await req.formData() }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }) }

  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const fileType = getFileType(file.name)
  const safeName = sanitizeFilename(file.name)
  const filePath = `${user.id}/${Date.now()}_${safeName}`

  const { error: storageError } = await supabaseAdmin.storage
    .from('khemet-brain')
    .upload(filePath, file, { contentType: file.type || 'application/octet-stream', upsert: true })

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const { data: source, error: sourceError } = await supabaseAdmin
    .from('knowledge_sources')
    .insert({ user_id: user.id, name: file.name, type: fileType, file_path: filePath, file_size: file.size, status: 'ready' })
    .select().single()

  if (sourceError || !source) return NextResponse.json({ error: 'Failed to save record' }, { status: 500 })

  try {
    const text = await extractText(file, fileType)
    const chunks = chunkText(text)
    for (let i = 0; i < chunks.length; i += 5) {
      const batch = chunks.slice(i, i + 5).map((content, idx) => ({ source_id: source.id, user_id: user.id, content, chunk_index: i + idx }))
      try {
        await supabaseAdmin.from('knowledge_chunks').insert(batch)
      } catch { }
    }
  } catch { }

  return NextResponse.json({ success: true, sourceId: source.id })
}
