/**
 * loop.ts — fixed-timestep game loop using requestAnimationFrame.
 *
 * Usage:
 *   const loop = createLoop({
 *     stepMs: 16,
 *     update(dt) { /* dt in seconds *\/ },
 *     render(alpha, fps) { /* alpha ∈ [0,1] *\/ },
 *   });
 *   loop.start();
 */

export interface LoopOptions {
  /** Fixed step duration in milliseconds (e.g. 16 ≈ 60 Hz). */
  stepMs: number;
  /** Called at fixed intervals; `dt` is stepMs converted to seconds. */
  update(dt: number): void;
  /** Called every animation frame; `alpha` is the interpolation factor [0,1]. */
  render(alpha: number, fps: number): void;
}

export interface Loop {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  running(): boolean;
}

export function createLoop(opts: LoopOptions): Loop {
  const { stepMs, update, render } = opts;
  const stepSec = stepMs / 1000;
  const MAX_DEBT_MS = 250; // spiral-of-death guard

  let rafId: number | null = null;
  let lastTime: number | null = null;
  let accumulator = 0;
  let _running = false;
  let _paused = false;

  // Rolling FPS (simple EMA)
  let fps = 0;
  const FPS_ALPHA = 0.1;

  function tick(now: number): void {
    if (_paused) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (lastTime === null) {
      lastTime = now;
    }

    const elapsed = Math.min(now - lastTime, MAX_DEBT_MS);
    lastTime = now;
    accumulator += elapsed;

    // Rolling FPS estimate
    const instantFps = elapsed > 0 ? 1000 / elapsed : fps;
    fps = fps === 0 ? instantFps : fps * (1 - FPS_ALPHA) + instantFps * FPS_ALPHA;

    while (accumulator >= stepMs) {
      update(stepSec);
      accumulator -= stepMs;
    }

    const alpha = accumulator / stepMs;
    render(alpha, fps);

    rafId = requestAnimationFrame(tick);
  }

  return {
    start(): void {
      if (_running) return;
      _running = true;
      _paused = false;
      lastTime = null;
      accumulator = 0;
      fps = 0;
      rafId = requestAnimationFrame(tick);
    },

    stop(): void {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      _running = false;
      _paused = false;
      lastTime = null;
      accumulator = 0;
    },

    pause(): void {
      _paused = true;
    },

    resume(): void {
      if (!_running) return;
      _paused = false;
      // Reset lastTime so we don't accumulate a large debt while paused
      lastTime = null;
    },

    running(): boolean {
      return _running;
    },
  };
}
