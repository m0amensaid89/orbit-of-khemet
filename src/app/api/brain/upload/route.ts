export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import mammoth from 'mammoth'

const STORAGE_LIMITS_MB: Record<string, number> = {
  personal_basic: 100, personal_explorer: 250, personal_starter: 500,
  business_pro: 1024, business_standard: 5120, business_enterprise: 15360, free: 50,
}
function getStorageLimitBytes(tier: string | null): number {
  return (STORAGE_LIMITS_MB[tier || "free"] ?? 50) * 1024 * 1024
}
function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use direct lib path to avoid pdf-parse loading test files at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js')
    const data = await pdfParse(buffer)
    const text = (data.text || '').replace(/\x00/g, '').trim()
    if (text.length > 50) return text.slice(0, 50000)
    return '[PDF: stored in Khemet Brain]'
  } catch {
    // Fallback to regex extraction if pdf-parse fails
    try {
      const content = buffer.toString('latin1')
      const textParts: string[] = []
      const tjRegex = /\(([^)]{1,500})\)\s*Tj/g
      let match
      while ((match = tjRegex.exec(content)) !== null) {
        const text = match[1].replace(/[^\x20-\x7E]/g, ' ').trim()
        if (text.length > 2) textParts.push(text)
      }
      const result = textParts.join(' ').replace(/\s{3,}/g, '  ').trim()
      return result.length > 50 ? result.slice(0, 50000) : '[PDF: stored in Khemet Brain]'
    } catch {
      return '[PDF: stored in Khemet Brain]'
    }
  }
}

async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const textParts: string[] = []

    // PPTX slides are in ppt/slides/slide*.xml
    const slideFiles = Object.keys(zip.files).filter(
      name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    ).sort()

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async('string')
      // Extract text from XML <a:t> tags
      const matches = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || []
      for (const match of matches) {
        const text = match.replace(/<[^>]+>/g, '').trim()
        if (text.length > 0) textParts.push(text)
      }
    }

    const result = textParts.join(' ').replace(/\s{3,}/g, '  ').trim()
    return result.length > 50 ? result.slice(0, 50000) : '[PPTX: stored in Khemet Brain]'
  } catch {
    return '[PPTX: stored in Khemet Brain]'
  }
}

async function extractText(file: File, type: string): Promise<string> {
  if (type === "image") {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const mimeType = file.type || "image/jpeg"
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: mimeType, data: base64 } },
              { text: "Describe this image in detail. Include all visible text, data, charts, diagrams, people, objects, colors, and any other relevant content. Be thorough and specific. This description will be used to answer questions about the image." }
            ]}]
          })
        }
      )
      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
        if (description.length > 20) return `[Image: ${file.name}]\n\n${description}`
      }
    } catch { }
    return `[Image: ${file.name} — stored in Khemet Brain]`
  }
  if (type === "video") return `[Video: ${file.name} — stored in Khemet Brain]`

  if (type === 'txt') {
    const text = await file.text()
    return text.replace(/\x00/g, '').slice(0, 50000)
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (type === 'pdf') {
    try {
      const result = await extractTextFromPDF(buffer)
      if (result && result !== `[PDF: stored in Khemet Brain]`) return result;
      return `[PDF: ${file.name} — stored in Khemet Brain]`
    } catch {
      return `[PDF: ${file.name} — stored in Khemet Brain]`
    }
  }

  if (type === 'docx') {
    try {
      const result = await mammoth.extractRawText({ buffer })
      const text = (result.value || '').replace(/\x00/g, '').trim()
      if (text.length > 50) return text.slice(0, 50000)
      return `[DOCX: ${file.name} — stored in Khemet Brain]`
    } catch {
      return `[DOCX: ${file.name} — stored in Khemet Brain]`
    }
  }

  if (type === 'xlsx') {
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const lines: string[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        lines.push(`=== Sheet: ${sheetName} ===\n${csv}`)
      }
      const text = lines.join('\n\n').replace(/\x00/g, '').trim()
      if (text.length > 50) return text.slice(0, 50000)
      return `[XLSX: ${file.name} — stored in Khemet Brain]`
    } catch {
      return `[XLSX: ${file.name} — stored in Khemet Brain]`
    }
  }

  if (type === 'pptx') {
    return await extractTextFromPPTX(buffer)
  }

  // Other binary formats fallback
  try {
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

  return `[${type.toUpperCase()}: ${file.name} — stored in Khemet Brain]`
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
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const filePath = `${user.id}/${Date.now()}_${randomSuffix}_${safeName}`

  const { data: profile } = await supabaseAdmin.from("profiles").select("tier").eq("id", user.id).single()
  const userTier = profile?.tier || "free"
  const limitBytes = getStorageLimitBytes(userTier)
  const { data: usageData } = await supabaseAdmin.from("knowledge_sources").select("file_size").eq("user_id", user.id)
  const currentUsageBytes = (usageData || []).reduce((sum: number, row: { file_size: number }) => sum + (row.file_size || 0), 0)
  if (currentUsageBytes + file.size > limitBytes) {
    return NextResponse.json({ error: `Storage limit reached. Your ${userTier.replace("_", " ")} plan allows ${formatBytes(limitBytes)}. Currently using ${formatBytes(currentUsageBytes)}. Delete some files or upgrade your plan.` }, { status: 403 })
  }

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
      const batch = chunks.slice(i, i + 5).map((content, idx) => ({
        source_id: source.id,
        user_id: user.id,
        content,
        chunk_index: i + idx,
      }))
      try {
        await supabaseAdmin.from('knowledge_chunks').insert(batch)
      } catch { }
    }
  } catch { }

  return NextResponse.json({ success: true, sourceId: source.id })
}
