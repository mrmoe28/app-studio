import {
  ApiClient,
  EditApi,
  Edit,
  Timeline,
  Track,
  Clip,
  ImageAsset,
  TitleAsset,
  Offset,
  Transition,
  Soundtrack,
  Output,
} from 'shotstack-sdk'

const apiKey = process.env.SHOTSTACK_API_KEY || ''
const apiEnv = (process.env.SHOTSTACK_API_ENV || 'sandbox') as 'sandbox' | 'v1'

// Initialize Shotstack client
const defaultClient = ApiClient.instance
const DeveloperKey = defaultClient.authentications['DeveloperKey']
DeveloperKey.apiKey = apiKey

// Set API environment
if (apiEnv === 'v1') {
  defaultClient.basePath = 'https://api.shotstack.io/v1'
} else {
  defaultClient.basePath = 'https://api.shotstack.io/stage'
}

const api = new EditApi()

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
  // Check for API key at runtime, not at module load time
  if (!apiKey) {
    throw new Error('SHOTSTACK_API_KEY environment variable is not set')
  }

  try {
    const clips: Clip[] = []
    const imageDuration = template.duration / template.images.length

    // Create clips for each image with transitions
    template.images.forEach((imageUrl, index) => {
      const imageAsset = new ImageAsset()
      imageAsset.setSrc(imageUrl)

      const transition = new Transition()
      transition.setIn('fade')
      transition.setOut('fade')

      const clip = new Clip()
      clip.setAsset(imageAsset)
      clip.setStart(index * imageDuration)
      clip.setLength(imageDuration)
      clip.setFit('crop')
      clip.setScale(1.1) // Slight zoom for Ken Burns effect
      clip.setTransition(transition)

      clips.push(clip)
    })

    // Add title overlay
    const titleAsset = new TitleAsset()
    titleAsset.setText(template.title)
    titleAsset.setStyle('minimal')
    titleAsset.setSize('large')
    titleAsset.setBackground(template.themeColor)
    titleAsset.setColor('#ffffff')

    const titleOffset = new Offset()
    titleOffset.setY(0.3)

    const titleClip = new Clip()
    titleClip.setAsset(titleAsset)
    titleClip.setStart(0)
    titleClip.setLength(3)
    titleClip.setPosition('center')
    titleClip.setOffset(titleOffset)

    clips.push(titleClip)

    // Add description overlay
    const descAsset = new TitleAsset()
    descAsset.setText(template.description)
    descAsset.setStyle('subtitle')
    descAsset.setSize('medium')
    descAsset.setColor('#ffffff')

    const descClip = new Clip()
    descClip.setAsset(descAsset)
    descClip.setStart(3)
    descClip.setLength(template.duration - 3)
    descClip.setPosition('bottom')

    clips.push(descClip)

    // Add logo if provided
    if (template.logo) {
      const logoAsset = new ImageAsset()
      logoAsset.setSrc(template.logo)

      const logoOffset = new Offset()
      logoOffset.setX(-0.05)
      logoOffset.setY(0.05)

      const logoClip = new Clip()
      logoClip.setAsset(logoAsset)
      logoClip.setStart(0)
      logoClip.setLength(template.duration)
      logoClip.setPosition('topRight')
      logoClip.setScale(0.15)
      logoClip.setOffset(logoOffset)

      clips.push(logoClip)
    }

    // Add background music if provided
    let soundtrack = undefined
    if (template.musicUrl) {
      soundtrack = new Soundtrack()
      soundtrack.setSrc(template.musicUrl)
      soundtrack.setEffect('fadeInFadeOut')
      soundtrack.setVolume(template.musicVolume || 0.5)
    }

    // Create track and timeline
    const track = new Track()
    track.setClips(clips)

    const timeline = new Timeline()
    timeline.setTracks([track])
    if (soundtrack) {
      timeline.setSoundtrack(soundtrack)
    }

    // Create output
    const output = new Output()
    output.setFormat('mp4')
    output.setResolution('hd')
    output.setFps(25)
    output.setScaleTo('1080')

    // Create edit
    const edit = new Edit()
    edit.setTimeline(timeline)
    edit.setOutput(output)

    // Submit render
    const response = await api.postRender(edit)

    return {
      success: true,
      renderId: response.response.id,
      message: response.response.message,
    }
  } catch (error) {
    console.error('Shotstack render error:', error)

    // Log full error details for debugging
    if (typeof error === 'object' && error !== null) {
      console.error('Error details:', JSON.stringify(error, null, 2))
    }

    if (error instanceof Error) {
      throw new Error(`Shotstack API error: ${error.message}`)
    }

    // Capture more error information
    const errorMessage = typeof error === 'object' && error !== null
      ? JSON.stringify(error)
      : String(error)

    throw new Error(`Failed to create video: ${errorMessage}`)
  }
}

/**
 * Check the status of a render
 */
export async function getRenderStatus(renderId: string) {
  // Check for API key at runtime
  if (!apiKey) {
    throw new Error('SHOTSTACK_API_KEY environment variable is not set')
  }

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
