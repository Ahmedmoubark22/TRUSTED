/**
 * Audio bus — infrastructure stub.
 *
 * No sound files exist yet. This exists so views can name the moments that
 * will eventually carry sound without any of them reaching for the Web Audio
 * API directly later on. Every call is currently a no-op.
 */

export type AudioCue =
  | 'ui.tap'
  | 'ui.confirm'
  | 'briefing.open'
  | 'briefing.close'
  | 'evidence.reveal'
  | 'vote.cast'
  | 'reveal.beat'
  | 'case.complete';

export interface AudioBus {
  readonly enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (cue: AudioCue) => void;
}

export function createAudioBus(): AudioBus {
  let enabled = true;
  return {
    get enabled() {
      return enabled;
    },
    setEnabled(next) {
      enabled = next;
    },
    play() {
      // Intentionally silent until the audio pass lands.
    },
  };
}

export const audio: AudioBus = createAudioBus();
