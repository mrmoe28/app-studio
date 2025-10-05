import { renderWithShotstack, type Shot as ShotstackShot } from './shotstack';
import { renderWithCreatomate, type Shot as CreatomateShot } from './creatomate';

export type Shot = ShotstackShot | CreatomateShot;

export interface RenderOptions {
  shots: Shot[];
  templateId?: string;
  aspect?: string;
}

export async function renderVideo({ shots, templateId, aspect }: RenderOptions) {
  const provider = process.env.VIDEO_PROVIDER || 'shotstack';
  const videoAspect = aspect || process.env.VIDEO_ASPECT || '9:16';

  switch (provider) {
    case 'creatomate':
      if (!process.env.CREATOMATE_API_KEY) {
        throw new Error('CREATOMATE_API_KEY is not set');
      }
      return renderWithCreatomate(shots, templateId, videoAspect);

    case 'shotstack':
    default:
      if (!process.env.SHOTSTACK_API_KEY) {
        throw new Error('SHOTSTACK_API_KEY is not set');
      }
      return renderWithShotstack(shots, videoAspect);
  }
}
