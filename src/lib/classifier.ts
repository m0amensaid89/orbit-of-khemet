import { RequestType } from './credits'

const VIDEO_CINEMATIC = ['cinematic','4k','professional video','campaign video','brand film','advertisement','high quality video','premium video']
const VIDEO_EDIT      = ['edit video','transform video','change video style','fix video','modify video']
const VIDEO_QUICK     = ['quick video','fast video','draft video','short clip','social video','preview video']
const VIDEO_GENERAL   = ['create video','make video','generate video','make a clip','animate this']
const IMAGE_GEN       = ['generate image','create image','draw','illustrate','design image','make image','create a picture','paint']
const IMAGE_ANALYSIS  = ['analyze this image','what is in this','describe this image','read this image','extract from image']
const CODE            = ['code','function','debug','script','program','build an app','write a component','fix this error','implement','algorithm']
const RESEARCH        = ['research','find information','look up','search for','what are the latest','find me','discover']
const REALTIME        = ['latest news','what happened today','right now','current events','breaking','this week','trending now']
const WEBSITE         = ['analyze this website','check this url','visit this site','what is on this page','summarize this page']
const DEEP            = ['deep analysis','comprehensive','thorough','detailed report','full breakdown','in-depth','analyze completely']

export function classifyRequest(
  message: string,
  hasImageAttachment = false,
  hasVideoAttachment = false
): RequestType {
  const lower = message.toLowerCase()

  if (hasVideoAttachment || VIDEO_EDIT.some(k => lower.includes(k))) return 'video_edit'

  const hasURL = /https?:\/\//.test(message)
  if (hasURL && WEBSITE.some(k => lower.includes(k))) return 'website_analysis'
  if (hasURL && !IMAGE_GEN.some(k => lower.includes(k))) return 'website_analysis'

  if (VIDEO_CINEMATIC.some(k => lower.includes(k))) return 'video_cinematic'
  if (VIDEO_QUICK.some(k => lower.includes(k)))     return 'video_quick'
  if (VIDEO_GENERAL.some(k => lower.includes(k)))   return 'video_standard'
  if (IMAGE_GEN.some(k => lower.includes(k)))       return 'image_generation'
  if (hasImageAttachment || IMAGE_ANALYSIS.some(k => lower.includes(k))) return 'image_analysis'
  if (DEEP.some(k => lower.includes(k)))            return 'deep_analysis'
  if (CODE.some(k => lower.includes(k)))            return 'code'
  if (REALTIME.some(k => lower.includes(k)))        return 'realtime'
  if (RESEARCH.some(k => lower.includes(k)))        return 'research'

  return 'text'
}
