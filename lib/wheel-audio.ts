// One audio context per experience, unlocked from a user gesture.
export class WheelAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = true;

  unlock() {
    if (!this.enabled) return;
    try {
      const Audio = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      if (!this.context) {
        this.context = new Audio();
        this.master = this.context.createGain();
        this.master.gain.value = 0.7;
        this.master.connect(this.context.destination);
      }
      void this.context.resume().catch(() => {});
    } catch { /* Audio is optional; spinning must always remain available. */ }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.context && this.master) {
      this.master.gain.setValueAtTime(enabled ? 0.7 : 0, this.context.currentTime);
    }
    if (enabled) this.unlock();
  }

  private note(frequency: number, delay: number, duration: number, volume: number, type: OscillatorType) {
    const ctx = this.context;
    if (!this.enabled || !ctx || !this.master || ctx.state !== "running") return;
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (type === "triangle") oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.45, start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  tick() {
    this.note(1450, 0, 0.035, 0.12, "triangle");
    this.note(260, 0, 0.025, 0.08, "sine");
  }

  celebrate() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      this.note(frequency, index * 0.105, 0.38, 0.085, "sine");
      this.note(frequency * 2, index * 0.105, 0.22, 0.018, "sine");
    });
  }

  dispose() {
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.master = null;
  }
}
