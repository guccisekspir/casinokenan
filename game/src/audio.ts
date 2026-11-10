/** Tüm sesler WebAudio ile sentezlenir (ses dosyası yok) + karakter konuşması için tarayıcı TTS. */
export class Audio {
  muted = false;
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private out: GainNode | null = null;
  private music: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private wave: Uint8Array<ArrayBuffer> | null = null;
  private voiceEl: HTMLAudioElement | null = null;
  private sawNodes: { gain: GainNode; lp: BiquadFilterNode; a: OscillatorNode; b: OscillatorNode; lfo: OscillatorNode } | null = null;

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

  /** Çalan bir ses kaydını analizöre bağlar: genliği dudak hareketini sürer. */
  attachVoice(el: HTMLAudioElement) {
    const ctx = this.ctx;
    if (!ctx || !this.out) return;
    try {
      if (!this.analyser) {
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.connect(this.out);
        this.wave = new Uint8Array(this.analyser.fftSize);
      }
      ctx.createMediaElementSource(el).connect(this.analyser);
      this.voiceEl = el;
    } catch {
      /* analiz edilemiyorsa kayıt yine normal çalar */
    }
  }

  /** Çalan kaydın anlık genliği (0..1). Kayıt yoksa 0. */
  voiceLevel(): number {
    const el = this.voiceEl;
    if (!this.analyser || !this.wave || !el || el.paused || el.ended) return 0;
    this.analyser.getByteTimeDomainData(this.wave);
    let sum = 0;
    for (const v of this.wave) sum += (v - 128) * (v - 128);
    return Math.min(1, (Math.sqrt(sum / this.wave.length) / 128) * 3);
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

  /** Yumruğun havayı yarması. Ağır yumrukta daha uzun ve kalın. */
  swing(heavy = false) {
    this.noise(heavy ? 0.24 : 0.14, 'bandpass', heavy ? 300 : 600, heavy ? 1800 : 2600, heavy ? 0.2 : 0.12);
  }
  /**
   * Darbe: gövdeye inen boğuk vuruş + etin şaklaması. Her vuruş biraz farklı tınlar.
   * @param metal muşta gibi sert bir şeyle mi vuruldu
   * @param power 1 normal, >1 ağır
   */
  punch(metal = false, power = 1) {
    const v = 0.9 + Math.random() * 0.25, heavy = power > 1.2;
    this.tone('sine', (heavy ? 120 : 150) * v, 38, heavy ? 0.26 : 0.15, heavy ? 0.95 : 0.7);
    this.noise(heavy ? 0.13 : 0.08, 'lowpass', (heavy ? 3200 : 1900) * v, 260, heavy ? 0.75 : 0.5);
    this.noise(0.035, 'highpass', 2200 * v, 5200, heavy ? 0.4 : 0.22); // şaklama
    if (heavy) this.tone('sine', 62, 30, 0.34, 0.6, 0.015); // göğüste hissedilen alt vuruş
    if (metal) this.tone('triangle', 1900 * v, 950, 0.07, heavy ? 0.2 : 0.12);
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
  /**
   * Testere motoru. Her karede çağrılır: 0 kapalı, 1 rölanti, 2 gaz, 3 ete değiyor (motor boğulur).
   */
  saw(level: 0 | 1 | 2 | 3) {
    const ctx = this.ctx;
    if (!ctx || !this.out) return;
    if (!this.sawNodes) {
      if (level === 0) return;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const a = ctx.createOscillator(), b = ctx.createOscillator(), lfo = ctx.createOscillator();
      a.type = 'sawtooth';
      b.type = 'square';
      lfo.type = 'square';
      lfo.frequency.value = 23; // motorun patlama ritmi
      const depth = ctx.createGain();
      depth.gain.value = 0.5;
      const trem = ctx.createGain();
      trem.gain.value = 0.5;
      lfo.connect(depth).connect(trem.gain);
      a.connect(lp);
      b.connect(lp);
      lp.connect(trem).connect(gain).connect(this.out);
      a.start();
      b.start();
      lfo.start();
      this.sawNodes = { gain, lp, a, b, lfo };
    }
    const n = this.sawNodes, t = ctx.currentTime;
    const f = [50, 52, 118, 84][level];
    n.a.frequency.setTargetAtTime(f, t, 0.06);
    n.b.frequency.setTargetAtTime(f * 1.51, t, 0.06);
    n.lfo.frequency.setTargetAtTime([20, 21, 46, 33][level], t, 0.06);
    n.lp.frequency.setTargetAtTime([400, 600, 2200, 1300][level], t, 0.06);
    n.gain.gain.setTargetAtTime(this.muted ? 0 : [0, 0.05, 0.17, 0.2][level], t, 0.05);
    if (level === 3 && Math.random() < 0.35) this.noise(0.07, 'bandpass', 2600, 900, 0.16); // dişlerin hırıltısı
  }

  /** Osmanlı tokadı: kırbaç gibi şaklama, ardından yerin çökmesi. */
  slam() {
    this.noise(0.05, 'highpass', 1800, 6000, 0.9);
    this.noise(0.5, 'lowpass', 2400, 90, 0.9, 0.02);
    this.tone('sine', 110, 26, 0.9, 1, 0.02);
    this.tone('sine', 55, 22, 1.3, 0.8, 0.06);
    for (let i = 0; i < 5; i++) this.noise(0.12, 'bandpass', 500 + Math.random() * 900, 200, 0.22, 0.18 + i * 0.09); // dökülen moloz
  }

  /** Demir parmaklığın inmesi. */
  clang() {
    for (const f of [311, 466, 740, 1175]) this.tone('triangle', f, f * 0.99, 1.1, 0.14);
    this.noise(0.12, 'highpass', 2500, 5000, 0.4);
    this.tone('sine', 90, 45, 0.3, 0.6);
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
    // Uzun bir para şakırtısı: önce sık, sonra seyrelerek.
    for (let i = 0; i < 54; i++) this.coin(0.7 + i * 0.075 + i * i * 0.0011 + Math.random() * 0.03);
  }

  speak(text: string, voice: { pitch: number; rate: number }, lang: 'tr' | 'en' = 'tr') {
    const synth = window.speechSynthesis;
    if (this.muted || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-US' : 'tr-TR';
    const match = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
    if (match) u.voice = match;
    u.pitch = voice.pitch;
    u.rate = voice.rate;
    u.volume = 0.9;
    synth.speak(u);
  }
}
