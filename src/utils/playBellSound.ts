let audioCtx: AudioContext | null = null

export async function playBellSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume()
    }

    const now = audioCtx.currentTime

    // Два гармонических тона (ноты Ми6 и Си6) с достаточной громкостью
    const notes = [
      { freq: 1318.5, start: 0, duration: 0.9, volume: 0.3 },
      { freq: 1975.5, start: 0.14, duration: 1.1, volume: 0.22 },
    ]

    notes.forEach(({ freq, start, duration, volume }) => {
      if (!audioCtx) return

      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      gain.gain.setValueAtTime(0.001, now + start)
      gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start(now + start)
      osc.stop(now + start + duration)
    })
  } catch (err) {
    console.warn('Audio playback blocked:', err)
  }
}
