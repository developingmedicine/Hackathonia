// Types a seeded transcript out in sync with its demo audio: progress is
// driven by audio.currentTime / audio.duration, so the text finishes exactly
// when the recording does (pauses included). Scenarios without audio — and
// audio that fails to load metadata within ~1.5s — fall back to the original
// fixed-speed animation (4 chars / 40ms) so the demo never stalls (PRD §38).

import { useEffect, useRef } from "react";

export function useSyncedTyping(
  active: boolean,
  text: string,
  getAudio: () => HTMLAudioElement | null,
  onUpdate: (partial: string, done: boolean) => void,
) {
  const cb = useRef(onUpdate);
  cb.current = onUpdate;

  useEffect(() => {
    if (!active || !text) return;
    const audio = getAudio();
    let chars = 0;
    let waitedMs = 0;
    let audioBroken = false;

    const timer = setInterval(() => {
      let partial: string;
      let done: boolean;
      const audioReady =
        audio &&
        !audio.error &&
        !audioBroken &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0;

      if (audioReady) {
        const progress = Math.min(audio.currentTime / audio.duration, 1);
        partial = text.slice(0, Math.ceil(progress * text.length));
        done = audio.ended || progress >= 1;
      } else if (audio && !audio.error && !audioBroken) {
        // metadata still loading — give it a moment, then fall back
        waitedMs += 40;
        if (waitedMs > 1500) audioBroken = true;
        return;
      } else {
        chars += 4;
        partial = text.slice(0, chars);
        done = chars >= text.length;
      }

      if (done) {
        partial = text;
        clearInterval(timer);
      }
      cb.current(partial, done);
    }, 40);

    return () => clearInterval(timer);
    // getAudio is read once per activation by design
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, text]);
}
