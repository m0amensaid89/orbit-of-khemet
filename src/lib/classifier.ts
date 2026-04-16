export type RequestType =
  | 'text' | 'code' | 'research' | 'image_generation'
  | 'image_analysis' | 'video_quick' | 'video_standard'
  | 'video_cinematic' | 'video_edit' | 'deep_analysis'
  | 'website_analysis' | 'realtime'

export interface ClassificationResult {
  requestType: RequestType
  confidence: number
  needsClarification: boolean
  clarificationOptions?: string[]
}

const OBVIOUS_VIDEO = ['create video','make video','generate video','make a clip','animate this','make me a video','create a video','video of','film of','movie of','shoot a video', 'quick video', 'professional video', 'cinematic video', '4k video']
const OBVIOUS_IMAGE = ['generate image','create image','create an image','make image','make an image','draw','illustrate','design image','create a picture','make a picture','generate a picture','paint','create artwork','generate artwork','image of','picture of','photo of','artwork of','create a visual','make a visual','visualize','render a','create a rendering','make a rendering','show me a picture','show me an image']
const OBVIOUS_CODE = ['write code','write a function','create a function','build a','debug this','fix this code','write a script','create a component','implement this','write a class','write a program','code that','function that','create an app','build an app']
const OBVIOUS_RESEARCH = ['research','find information','search for','what are the latest','current news','recent developments','look up','find out about','tell me the latest','what happened with','news about']
const OBVIOUS_WEBSITE = ['analyze this website','check this url','visit this site','scrape','summarize this page','what is on this page']

export function classifyRequest(
  message: string,
  hasImageAttachment = false,
  hasVideoAttachment = false
): ClassificationResult {
  const lower = message.toLowerCase().trim()

  if (hasVideoAttachment) return { requestType: 'video_edit', confidence: 1, needsClarification: false }
  if (hasImageAttachment) return { requestType: 'image_analysis', confidence: 1, needsClarification: false }
  if (lower.match(/https?:\/\//)) return { requestType: 'website_analysis', confidence: 0.9, needsClarification: false }

  if (OBVIOUS_VIDEO.some(k => lower.includes(k))) {
    const isCinematic = lower.includes('cinematic') || lower.includes('4k') || lower.includes('film')
    const isPro = lower.includes('professional') || lower.includes('high quality')
    return {
      requestType: isCinematic ? 'video_cinematic' : isPro ? 'video_standard' : 'video_quick',
      confidence: 0.95,
      needsClarification: false
    }
  }

  if (OBVIOUS_IMAGE.some(k => lower.includes(k))) {
    return { requestType: 'image_generation', confidence: 0.95, needsClarification: false }
  }

  if (OBVIOUS_CODE.some(k => lower.includes(k)) || lower.includes('```') || lower.match(/\b(function|const|class|import|export)\b/)) {
    return { requestType: 'code', confidence: 0.9, needsClarification: false }
  }

  if (OBVIOUS_RESEARCH.some(k => lower.includes(k))) {
    return { requestType: 'research', confidence: 0.9, needsClarification: false }
  }

  if (OBVIOUS_WEBSITE.some(k => lower.includes(k))) {
    return { requestType: 'website_analysis', confidence: 0.9, needsClarification: false }
  }

  // Ambiguous creative request — could be image, video, or text
  const wantsVisual = lower.includes('show') || lower.includes('visual') || lower.includes('see') || lower.includes('display') || lower.includes('create') || lower.includes('make') || lower.includes('generate')
  const mentionsContent = lower.includes('of') || lower.includes('about') || lower.includes('with')

  if (wantsVisual && mentionsContent && lower.length > 20) {
    return {
      requestType: 'text',
      confidence: 0.4,
      needsClarification: true,
      clarificationOptions: ['🖼 Generate Image', '🎬 Create Video', '✍️ Write Text', '🔍 Research Topic']
    }
  }

  const isDeep = lower.length > 150 || lower.includes('analyze') || lower.includes('compare') || lower.includes('evaluate') || lower.includes('comprehensive')
  if (isDeep) return { requestType: 'deep_analysis', confidence: 0.8, needsClarification: false }

  return { requestType: 'text', confidence: 0.85, needsClarification: false }
}
