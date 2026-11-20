/**
 * audio.ts — procedural WebAudio bleeps (FR-9).
 * All sounds created lazily after first user gesture.
 * Mute state is passed in from the store.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function play(
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  durationMs: number,
  gain = 0.18,
): void {
  try {
    const ac  = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const env = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.linearRampToValueAtTime(freqEnd, now + durationMs / 1000);

    env.gain.setValueAtTime(gain, now);
    env.gain.linearRampToValueAtTime(0, now + durationMs / 1000);

    osc.connect(env);
    env.connect(ac.destination);

    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.01);
  } catch {
    // audio unavailable — degrade silently
  }
}

export function playHop(muted: boolean): void {
  if (muted) return;
  play('square', 300, 420, 80);
}

export function playCollect(muted: boolean): void {
  if (muted) return;
  play('sine', 660, 990, 120, 0.22);
}

export function playDeath(muted: boolean): void {
  if (muted) return;
  play('sawtooth', 220, 60, 400, 0.25);
}

export function playTierUp(muted: boolean): void {
  if (muted) return;
  play('sine', 440, 660, 150, 0.15);
}
