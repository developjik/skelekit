/**
 * assets.ts — preload images and audio with a progress callback.
 *
 * Usage:
 *   const assets = await loadAssets({
 *     hero: '/assets/hero.png',
 *     jump: '/assets/jump.mp3',
 *   }, (loaded, total) => console.log(`${loaded}/${total}`));
 *   // assets.hero → HTMLImageElement
 *   // assets.jump → HTMLAudioElement
 */

export type AssetElement = HTMLImageElement | HTMLAudioElement;

export type AssetRecord<T extends Record<string, string>> = {
  [K in keyof T]: AssetElement;
};

/** Called each time one asset finishes loading. */
export type ProgressCallback = (loaded: number, total: number) => void;

const IMAGE_EXTS = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const AUDIO_EXTS = /\.(mp3|ogg|wav|flac|aac|opus)$/i;

/**
 * Preload every URL in `manifest`.
 * - Files whose extensions match image patterns load as `HTMLImageElement`.
 * - Files whose extensions match audio patterns load as `HTMLAudioElement`.
 * - Unknown extensions are treated as images (HTMLImageElement).
 *
 * Rejects with `Error('loadAssets: failed to load key "<key>"')` if any
 * single asset fails to load.
 */
export async function loadAssets<T extends Record<string, string>>(
  manifest: T,
  onProgress?: ProgressCallback,
): Promise<AssetRecord<T>> {
  const entries = Object.entries(manifest) as [keyof T & string, string][];
  const total = entries.length;
  let loaded = 0;

  const result = {} as AssetRecord<T>;

  await Promise.all(
    entries.map(([key, url]) => {
      return new Promise<void>((resolve, reject) => {
        let el: AssetElement;

        if (AUDIO_EXTS.test(url)) {
          const audio = new Audio();
          audio.preload = 'auto';
          el = audio;
          audio.addEventListener('canplaythrough', () => {
            result[key] = el;
            loaded++;
            onProgress?.(loaded, total);
            resolve();
          }, { once: true });
          audio.addEventListener('error', () => {
            reject(new Error(`loadAssets: failed to load key "${key}"`));
          }, { once: true });
          audio.src = url;
        } else {
          const img = new Image();
          el = img;
          img.addEventListener('load', () => {
            result[key] = el;
            loaded++;
            onProgress?.(loaded, total);
            resolve();
          }, { once: true });
          img.addEventListener('error', () => {
            reject(new Error(`loadAssets: failed to load key "${key}"`));
          }, { once: true });
          img.src = url;
        }
      });
    }),
  );

  return result;
}
