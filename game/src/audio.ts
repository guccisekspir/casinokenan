/** Tüm sesler WebAudio ile sentezlenir (ses dosyası yok) + karakter konuşması için tarayıcı TTS. */
export class Audio {
  muted = false;
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private out: GainNode | null = null;
  private music: GainNode | null = null;

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

      // Boş bir salon: bütün sesler uzun bir yankıya da gider.
      this.out = this.ctx.createGain();
      this.out.connect(this.ctx.destination);
      const len = Math.floor(n * 2.8);
      const ir = this.ctx.createBuffer(2, len, n);
      for (let ch = 0; ch < 2; ch++) {
        const x = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      const verb = this.ctx.createConvolver();
      verb.buffer = ir;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.42;
      this.out.connect(verb).connect(wet).connect(this.ctx.destination);
    }
    void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) window.speechSynthesis?.cancel();
    if (this.music && this.ctx) this.music.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.3);
  }

  /** Film müziği: alçak bir dem sesi üstüne seyrek, yalnız piyano notaları. */
  startMusic() {
    const ctx = this.ctx;
    if (!ctx || this.music || !this.out) return;
    const m = (this.music = ctx.createGain());
    m.gain.value = this.muted ? 0 : 1;
    m.connect(this.out);
    for (const [f, g] of [[73.4, 0.05], [110, 0.03], [146.2, 0.018]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = g;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + Math.random() * 0.08;
      const depth = ctx.createGain();
      depth.gain.value = g * 0.6;
      lfo.connect(depth).connect(gain.gain);
      o.connect(gain).connect(m);
      o.start();
      lfo.start();
    }
    const scale = [293.7, 349.2, 392, 440, 523.3, 587.3, 698.5]; // re minör
    let last = 3;
    const note = () => {
      last = Math.max(0, Math.min(scale.length - 1, last + Math.floor(Math.random() * 5) - 2));
      const t = ctx.currentTime + 0.05;
      for (const [mult, vol] of [[1, 0.07], [2, 0.02], [0.5, 0.03]]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = scale[last] * mult;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 3.5);
        o.connect(g).connect(m);
        o.start(t);
        o.stop(t + 3.6);
      }
      window.setTimeout(note, 1800 + Math.random() * 3800);
    };
    window.setTimeout(note, 1500);
  }

  /** Ara yazı / perde geçişi: tek, derin bir vuruş. */
  toll() {
    this.tone('sine', 55, 52, 2.5, 0.5);
    this.tone('sine', 220, 219, 2.2, 0.06);
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
    src.connect(f).connect(g).connect(this.out!);
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
    o.connect(g).connect(this.out!);
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
  /** Bedenin ya da kopan bir uzvun yere düşmesi. */
  thud(heavy = false) {
    this.tone('sine', heavy ? 95 : 130, 38, heavy ? 0.3 : 0.16, heavy ? 0.8 : 0.35);
    this.noise(heavy ? 0.14 : 0.07, 'lowpass', heavy ? 700 : 1100, 120, heavy ? 0.5 : 0.25);
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
