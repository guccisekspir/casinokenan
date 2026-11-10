/** Tüm sesler WebAudio ile sentezlenir (ses dosyası yok) + karakter konuşması için tarayıcı TTS. */
export class Audio {
  muted = false;
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;

  /** İlk kullanıcı etkileşiminde çağrılmalı (tarayıcı otomatik oynatma kuralı). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const n = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, n, n);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) window.speechSynthesis?.cancel();
  }

  private noise(dur: number, type: BiquadFilterType, f0: number, f1: number, gain: number, delay = 0) {
    const ctx = this.ctx;
    if (!ctx || this.muted || !this.noiseBuf) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t, Math.random() * 0.5, dur);
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, gain: number, delay = 0) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  }

  swing() {
    this.noise(0.16, 'bandpass', 500, 2400, 0.12);
  }
  punch(heavy = false) {
    this.tone('sine', heavy ? 170 : 140, 45, 0.16, 0.7);
    this.noise(0.09, 'lowpass', heavy ? 2600 : 1600, 300, 0.5);
    if (heavy) this.tone('triangle', 1800, 900, 0.06, 0.12);
  }
  slash() {
    this.noise(0.22, 'bandpass', 5000, 900, 0.3);
    this.noise(0.12, 'lowpass', 900, 200, 0.35, 0.03);
  }
  saber() {
    this.tone('sawtooth', 95, 180, 0.3, 0.16);
    this.tone('sawtooth', 143, 60, 0.3, 0.12);
    this.noise(0.25, 'highpass', 3000, 6000, 0.1);
  }
  shot() {
    this.noise(0.22, 'lowpass', 7000, 400, 0.9);
    this.tone('square', 190, 40, 0.14, 0.35);
  }
  sever() {
    this.noise(0.35, 'lowpass', 1400, 150, 0.7);
    this.tone('sine', 90, 40, 0.3, 0.5);
  }
  coin(delay = 0) {
    this.tone('triangle', 1318, 1318, 0.08, 0.14, delay);
    this.tone('triangle', 1976, 1976, 0.22, 0.14, delay + 0.07);
  }
  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone('square', f, f, 0.22, 0.1, i * 0.11));
    for (let i = 0; i < 14; i++) this.coin(0.7 + i * 0.09);
  }

  speak(text: string, voice: { pitch: number; rate: number }) {
    const synth = window.speechSynthesis;
    if (this.muted || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'tr-TR';
    const tr = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('tr'));
    if (tr) u.voice = tr;
    u.pitch = voice.pitch;
    u.rate = voice.rate;
    u.volume = 0.9;
    synth.speak(u);
  }
}
