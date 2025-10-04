declare module 'shotstack-sdk' {
  export default Shotstack

  namespace Shotstack {
    class ApiClient {
      static instance: ApiClient
      authentications: {
        DeveloperKey: {
          apiKey: string
        }
      }
      basePath: string
    }

    class EditApi {
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

    class Edit {
      timeline?: Timeline
      output?: Output
    }

    class Timeline {
      tracks?: Track[]
      soundtrack?: Soundtrack
    }

    class Track {
      clips?: Clip[]
    }

    class Clip {
      asset?: ImageAsset | TitleAsset | AudioAsset
      start?: number
      length?: number
      fit?: Clip.FitEnum
      scale?: number
      position?: Clip.PositionEnum
      offset?: Offset
      transition?: Transition
    }

    namespace Clip {
      enum FitEnum {
        Cover = 'cover',
        Contain = 'contain',
        Crop = 'crop',
        None = 'none'
      }

      enum PositionEnum {
        Top = 'top',
        TopRight = 'topRight',
        Right = 'right',
        BottomRight = 'bottomRight',
        Bottom = 'bottom',
        BottomLeft = 'bottomLeft',
        Left = 'left',
        TopLeft = 'topLeft',
        Center = 'center'
      }
    }

    class ImageAsset {
      src?: string
    }

    class TitleAsset {
      text?: string
      style?: TitleAsset.StyleEnum
      size?: TitleAsset.SizeEnum
      background?: string
      color?: string
    }

    namespace TitleAsset {
      enum StyleEnum {
        Minimal = 'minimal',
        Blockbuster = 'blockbuster',
        Vogue = 'vogue',
        Sketchy = 'sketchy',
        Skinny = 'skinny',
        Chunk = 'chunk',
        ChunkLight = 'chunkLight',
        Marker = 'marker',
        Future = 'future',
        Subtitle = 'subtitle'
      }

      enum SizeEnum {
        Small = 'small',
        Medium = 'medium',
        Large = 'large'
      }
    }

    class AudioAsset {
      src?: string
      volume?: number
    }

    class Offset {
      x?: number
      y?: number
    }

    class Transition {
      in?: Transition.InEnum
      out?: Transition.OutEnum
    }

    namespace Transition {
      enum InEnum {
        Fade = 'fade',
        FadeIn = 'fadeIn',
        FadeOut = 'fadeOut',
        SlideLeft = 'slideLeft',
        SlideRight = 'slideRight',
        SlideUp = 'slideUp',
        SlideDown = 'slideDown',
        Zoom = 'zoom'
      }

      enum OutEnum {
        Fade = 'fade',
        FadeIn = 'fadeIn',
        FadeOut = 'fadeOut',
        SlideLeft = 'slideLeft',
        SlideRight = 'slideRight',
        SlideUp = 'slideUp',
        SlideDown = 'slideDown',
        Zoom = 'zoom'
      }
    }

    class Soundtrack {
      src?: string
      effect?: Soundtrack.EffectEnum
      volume?: number
    }

    namespace Soundtrack {
      enum EffectEnum {
        FadeIn = 'fadeIn',
        FadeOut = 'fadeOut',
        FadeInFadeOut = 'fadeInFadeOut'
      }
    }

    class Output {
      format?: Output.FormatEnum
      resolution?: Output.ResolutionEnum
      fps?: number
      scaleTo?: Output.ScaleToEnum
    }

    namespace Output {
      enum FormatEnum {
        Mp4 = 'mp4',
        Gif = 'gif',
        Mp3 = 'mp3'
      }

      enum ResolutionEnum {
        Preview = 'preview',
        Mobile = 'mobile',
        Sd = 'sd',
        Hd = 'hd',
        _1080 = '1080'
      }

      enum ScaleToEnum {
        Preview = 'preview',
        Mobile = 'mobile',
        Sd = 'sd',
        Hd = 'hd',
        _1080 = '1080'
      }
    }
  }
}
