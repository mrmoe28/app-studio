import Shotstack from 'shotstack-sdk'

const apiKey = process.env.SHOTSTACK_API_KEY!
const apiEnv = (process.env.SHOTSTACK_API_ENV || 'sandbox') as 'sandbox' | 'v1'

// Initialize Shotstack client
const defaultClient = Shotstack.ApiClient.instance
const DeveloperKey = defaultClient.authentications['DeveloperKey']
DeveloperKey.apiKey = apiKey

// Set API environment
if (apiEnv === 'v1') {
  defaultClient.basePath = 'https://api.shotstack.io/v1'
} else {
  defaultClient.basePath = 'https://api.shotstack.io/stage'
}

const api = new Shotstack.EditApi()

interface VideoTemplate {
  title: string
  description: string
  duration: number
  images: string[]
  logo?: string
  themeColor: string
  musicUrl?: string
  musicVolume?: number
}

/**
 * Create a promotional video using Shotstack
 */
export async function createPromoVideo(template: VideoTemplate) {
  try {
    const clips: Shotstack.Clip[] = []
    const imageDuration = template.duration / template.images.length

    // Create clips for each image with transitions
    template.images.forEach((imageUrl, index) => {
      const imageAsset = new Shotstack.ImageAsset()
      imageAsset.src = imageUrl

      const clip = new Shotstack.Clip()
      clip.asset = imageAsset
      clip.start = index * imageDuration
      clip.length = imageDuration
      clip.fit = Shotstack.Clip.FitEnum.Cover
      clip.scale = 1.1 // Slight zoom for Ken Burns effect

      // Add transition
      clip.transition = new Shotstack.Transition()
      clip.transition.in = Shotstack.Transition.InEnum.Fade
      clip.transition.out = Shotstack.Transition.OutEnum.Fade

      clips.push(clip)
    })

    // Add title overlay
    const titleAsset = new Shotstack.TitleAsset()
    titleAsset.text = template.title
    titleAsset.style = Shotstack.TitleAsset.StyleEnum.Minimal
    titleAsset.size = Shotstack.TitleAsset.SizeEnum.Large
    titleAsset.background = template.themeColor
    titleAsset.color = '#ffffff'

    const titleClip = new Shotstack.Clip()
    titleClip.asset = titleAsset
    titleClip.start = 0
    titleClip.length = 3
    titleClip.position = Shotstack.Clip.PositionEnum.Center
    titleClip.offset = new Shotstack.Offset()
    titleClip.offset.y = 0.3

    clips.push(titleClip)

    // Add description overlay
    const descAsset = new Shotstack.TitleAsset()
    descAsset.text = template.description
    descAsset.style = Shotstack.TitleAsset.StyleEnum.Subtitle
    descAsset.size = Shotstack.TitleAsset.SizeEnum.Medium
    descAsset.color = '#ffffff'

    const descClip = new Shotstack.Clip()
    descClip.asset = descAsset
    descClip.start = 3
    descClip.length = template.duration - 3
    descClip.position = Shotstack.Clip.PositionEnum.Bottom

    clips.push(descClip)

    // Add logo if provided
    if (template.logo) {
      const logoAsset = new Shotstack.ImageAsset()
      logoAsset.src = template.logo

      const logoClip = new Shotstack.Clip()
      logoClip.asset = logoAsset
      logoClip.start = 0
      logoClip.length = template.duration
      logoClip.position = Shotstack.Clip.PositionEnum.TopRight
      logoClip.scale = 0.15
      logoClip.offset = new Shotstack.Offset()
      logoClip.offset.x = -0.05
      logoClip.offset.y = 0.05

      clips.push(logoClip)
    }

    // Add background music if provided
    const soundtracks: Shotstack.Soundtrack[] = []
    if (template.musicUrl) {
      const audioAsset = new Shotstack.AudioAsset()
      audioAsset.src = template.musicUrl
      audioAsset.volume = template.musicVolume || 0.5

      const soundtrack = new Shotstack.Soundtrack()
      soundtrack.src = template.musicUrl
      soundtrack.effect = Shotstack.Soundtrack.EffectEnum.FadeInFadeOut
      soundtrack.volume = template.musicVolume || 0.5

      soundtracks.push(soundtrack)
    }

    // Create track and timeline
    const track = new Shotstack.Track()
    track.clips = clips

    const timeline = new Shotstack.Timeline()
    timeline.tracks = [track]
    timeline.soundtrack = soundtracks.length > 0 ? soundtracks[0] : undefined

    // Create output
    const output = new Shotstack.Output()
    output.format = Shotstack.Output.FormatEnum.Mp4
    output.resolution = Shotstack.Output.ResolutionEnum.Hd
    output.fps = 25
    output.scaleTo = Shotstack.Output.ScaleToEnum._1080

    // Create edit
    const edit = new Shotstack.Edit()
    edit.timeline = timeline
    edit.output = output

    // Submit render
    const response = await api.postRender(edit)

    return {
      success: true,
      renderId: response.response.id,
      message: response.response.message,
    }
  } catch (error) {
    console.error('Shotstack render error:', error)
    throw new Error('Failed to create video')
  }
}

/**
 * Check the status of a render
 */
export async function getRenderStatus(renderId: string) {
  try {
    const response = await api.getRender(renderId)

    return {
      success: true,
      status: response.response.status,
      url: response.response.url,
      error: response.response.error,
    }
  } catch (error) {
    console.error('Failed to get render status:', error)
    throw new Error('Failed to check render status')
  }
}

/**
 * Get render details including download URL
 */
export async function getVideoUrl(renderId: string): Promise<string | null> {
  const status = await getRenderStatus(renderId)

  if (status.status === 'done' && status.url) {
    return status.url
  }

  return null
}
