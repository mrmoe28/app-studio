declare module 'shotstack-sdk' {
  export class ApiClient {
    static instance: ApiClient
    authentications: {
      DeveloperKey: {
        apiKey: string
      }
    }
    basePath: string
  }

  export class EditApi {
    postRender(edit: Edit): Promise<{
      response: {
        id: string
        message: string
      }
    }>

    getRender(id: string): Promise<{
      response: {
        id: string
        owner: string
        status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
        url?: string
        error?: string
        created: string
        updated: string
      }
    }>
  }

  export class Edit {
    setTimeline(timeline: Timeline): Edit
    setOutput(output: Output): Edit
  }

  export class Timeline {
    setTracks(tracks: Track[]): Timeline
    setSoundtrack(soundtrack: Soundtrack): Timeline
  }

  export class Track {
    setClips(clips: Clip[]): Track
  }

  export class Clip {
    setAsset(asset: ImageAsset | TitleAsset | AudioAsset): Clip
    setStart(start: number): Clip
    setLength(length: number): Clip
    setFit(fit: string): Clip
    setScale(scale: number): Clip
    setPosition(position: string): Clip
    setOffset(offset: Offset): Clip
    setTransition(transition: Transition): Clip
  }

  export class ImageAsset {
    setSrc(src: string): ImageAsset
  }

  export class TitleAsset {
    setText(text: string): TitleAsset
    setStyle(style: string): TitleAsset
    setSize(size: string): TitleAsset
    setBackground(background: string): TitleAsset
    setColor(color: string): TitleAsset
    setPosition(position: string): TitleAsset
    setOffset(offset: Offset): TitleAsset
  }

  export class AudioAsset {
    setSrc(src: string): AudioAsset
    setVolume(volume: number): AudioAsset
  }

  export class Offset {
    setX(x: number): Offset
    setY(y: number): Offset
  }

  export class Transition {
    setIn(inTransition: string): Transition
    setOut(outTransition: string): Transition
  }

  export class Soundtrack {
    setSrc(src: string): Soundtrack
    setEffect(effect: string): Soundtrack
    setVolume(volume: number): Soundtrack
  }

  export class Output {
    setFormat(format: string): Output
    setResolution(resolution: string): Output
    setFps(fps: number): Output
    setScaleTo(scaleTo: string): Output
  }
}
