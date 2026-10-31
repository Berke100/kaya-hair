/**
 * SESLİ TUR — tamamen tarayıcıda sentezlenen ses manzarası (Web Audio API).
 * Hiç ses dosyası yüklenmez.
 *
 * Katmanlar:
 *  - Sokak: alçak geçirgen uğultu + ara sıra geçen araba.
 *  - Salon: yumuşak lounge müziği (FM elektrik piyano, fırça zil) +
 *           uzaktan makas ve saç makinesi sesleri.
 *  - Olaylar: kapı zili (turda kapıdan geçerken), kahve makinesi (ikram),
 *             kısa makine vızıltısı (imleç bir butonun üzerine gelince).
 *
 * Karışım kaydırmaya bağlıdır: turun başında sokak, kapıdan sonra salon.
 * Ses yalnızca ziyaretçi düğmeye bastıktan sonra başlar.
 */

type Listener = (on: boolean) => void;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

class Soundscape {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private streetBus!: GainNode;
  private salonBus!: GainNode;
  private musicBus!: GainNode;
  private fxBus!: GainNode;
  private noise!: AudioBuffer;
  private on = false;
  private listeners = new Set<Listener>();
  private timers: number[] = [];
  private nextChord = 0;
  private chordIdx = 0;
  private lastP = 0;
  private lastHover = 0;
  private streetLevel = 1;
  private salonLevel = 0;

  get enabled() {
    return this.on;
  }

  /** Tarayıcı Web Audio destekliyor mu? Desteklemiyorsa ses düğmeleri gizlenir. */
  get supported() {
    return typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.on);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.on));
  }

  /** Düğmeye basılınca çağrılır (kullanıcı hareketi gerekir). */
  async toggle() {
    if (this.on) this.disable();
    else await this.enable();
  }

  async enable() {
    if (!this.supported) return;
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    if (ctx.state !== 'running') await ctx.resume();
    this.on = true;
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(1.15, t, 0.6);
    this.nextChord = Math.max(this.nextChord, t + 0.3);
    this.startSchedulers();
    this.emit();
  }

  disable() {
    if (!this.ctx) return;
    this.on = false;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.25);
    this.stopSchedulers();
    window.setTimeout(() => {
      if (!this.on) this.ctx?.suspend();
    }, 1200);
    this.emit();
  }

  /* ------------------------------------------------------------ */
  /* Kurulum                                                       */
  /* ------------------------------------------------------------ */

  private build() {
    // iOS: Web Audio varsayılan olarak sessiz anahtarına uyar; medya sesi gibi çalsın.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    comp.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp);

    this.streetBus = ctx.createGain();
    this.salonBus = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.fxBus = ctx.createGain();
    this.streetBus.gain.value = this.streetLevel;
    this.salonBus.gain.value = this.salonLevel;
    this.musicBus.gain.value = 0.55;
    this.fxBus.gain.value = 0.9;
    this.streetBus.connect(this.master);
    this.salonBus.connect(this.master);
    this.fxBus.connect(this.master);

    // Müzik: yumuşak alçak geçiren + hafif oda yankısı
    const musicHP = ctx.createBiquadFilter();
    musicHP.type = 'highpass';
    musicHP.frequency.value = 90;
    const musicLP = ctx.createBiquadFilter();
    musicLP.type = 'lowpass';
    musicLP.frequency.value = 2600;
    this.musicBus.connect(musicHP);
    musicHP.connect(musicLP);
    musicLP.connect(this.salonBus);
    const verb = ctx.createConvolver();
    verb.buffer = this.makeImpulse(1.8);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.22;
    musicLP.connect(verb);
    verb.connect(verbGain);
    verbGain.connect(this.salonBus);

    // Beyaz gürültü tamponu (4 sn)
    const len = ctx.sampleRate * 4;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // Sokak uğultusu (sürekli)
    const street = ctx.createBufferSource();
    street.buffer = this.noise;
    street.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    lp.Q.value = 0.4;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    const sg = ctx.createGain();
    sg.gain.value = 0.32;
    street.connect(lp);
    lp.connect(sg);
    sg.connect(this.streetBus);
    street.start();
    lfo.start();

    // Salonun oda tonu (çok hafif)
    const room = ctx.createBufferSource();
    room.buffer = this.noise;
    room.loop = true;
    const rbp = ctx.createBiquadFilter();
    rbp.type = 'bandpass';
    rbp.frequency.value = 380;
    rbp.Q.value = 0.6;
    const rg = ctx.createGain();
    rg.gain.value = 0.05;
    room.connect(rbp);
    rbp.connect(rg);
    rg.connect(this.salonBus);
    room.start();

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend();
      else if (this.on) this.ctx.resume();
    });
  }

  private makeImpulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  /* ------------------------------------------------------------ */
  /* Zamanlayıcılar                                                */
  /* ------------------------------------------------------------ */

  private startSchedulers() {
    this.stopSchedulers();
    this.timers.push(window.setInterval(() => this.scheduleMusic(), 150));
    const shop = () => {
      if (this.on && this.salonLevel > 0.05) this.shopEvent();
      this.timers.push(window.setTimeout(shop, rand(2600, 6200)));
    };
    const car = () => {
      if (this.on && this.streetLevel > 0.08) this.carPass();
      this.timers.push(window.setTimeout(car, rand(5000, 11000)));
    };
    this.timers.push(window.setTimeout(shop, 1800));
    this.timers.push(window.setTimeout(car, 1500));
  }

  private stopSchedulers() {
    this.timers.forEach((id) => {
      window.clearInterval(id);
      window.clearTimeout(id);
    });
    this.timers = [];
  }

  /* ------------------------------------------------------------ */
  /* Müzik: ii–V–I dolaşan yumuşak lounge                          */
  /* ------------------------------------------------------------ */

  private chords = [
    [50, 53, 57, 60, 64], // Dm9
    [43, 53, 59, 64], // G13
    [48, 52, 59, 62], // Cmaj9
    [41, 52, 57, 60], // Fmaj7
  ];
  private scale = [72, 74, 76, 79, 81, 84];

  private scheduleMusic() {
    const ctx = this.ctx;
    if (!ctx || !this.on) return;
    const bar = 3.4;
    while (this.nextChord < ctx.currentTime + 0.6) {
      const t = this.nextChord;
      const notes = this.chords[this.chordIdx % this.chords.length];
      notes.forEach((n, i) => this.epiano(midi(n), t + i * 0.035 + rand(0, 0.015), i === 0 ? 0.1 : 0.09, 3.2));
      // Ara ara tek bir melodi notası
      if (Math.random() < 0.6) {
        const m = this.scale[Math.floor(Math.random() * this.scale.length)];
        this.epiano(midi(m), t + bar * (Math.random() < 0.5 ? 0.5 : 0.75), 0.06, 2);
      }
      // Fırça zil, swing
      for (let k = 0; k < 4; k++) this.brush(t + k * (bar / 4) + (k % 2 ? 0.09 : 0), k % 2 ? 0.018 : 0.028);
      this.chordIdx++;
      this.nextChord += bar;
    }
  }

  private epiano(f: number, t: number, vel: number, dur: number) {
    const ctx = this.ctx!;
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const amp = ctx.createGain();
    car.type = 'sine';
    mod.type = 'sine';
    car.frequency.value = f;
    mod.frequency.value = f;
    modGain.gain.setValueAtTime(f * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.15, t + 0.9);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    amp.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.6);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(amp);
    amp.connect(this.musicBus);
    car.start(t);
    mod.start(t);
    car.stop(t + dur + 0.05);
    mod.stop(t + dur + 0.05);
  }

  private brush(t: number, vel: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.musicBus);
    src.start(t, rand(0, 3));
    src.stop(t + 0.15);
  }

  /* ------------------------------------------------------------ */
  /* Salon sesleri                                                 */
  /* ------------------------------------------------------------ */

  private panner(pan: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    p.connect(dest);
    return p;
  }

  private shopEvent() {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.05;
    const pan = rand(-0.7, 0.7);
    const r = Math.random();
    if (r < 0.5) {
      const n = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) this.snip(t + i * rand(0.22, 0.34), pan, 0.09);
    } else if (r < 0.8) {
      this.clipper(t, rand(1.2, 2.6), 0.055, pan, this.salonBus);
    }
  }

  private snip(t: number, pan: number, vel: number) {
    const ctx = this.ctx!;
    const out = this.panner(pan, this.salonBus);
    [0, 0.045].forEach((off, i) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = i ? 5200 : 3600;
      bp.Q.value = 2.5;
      const g = ctx.createGain();
      const s = t + off;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(vel * (i ? 0.7 : 1), s + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.05);
      src.connect(bp);
      bp.connect(g);
      g.connect(out);
      src.start(s, rand(0, 3));
      src.stop(s + 0.07);
    });
  }

  private clipper(t: number, dur: number, vel: number, pan: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const out = this.panner(pan, dest);
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'square';
    o1.frequency.value = 118;
    o2.frequency.value = 237.5;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1300;
    bp.Q.value = 0.9;
    const am = ctx.createOscillator();
    am.frequency.value = 31;
    const amGain = ctx.createGain();
    amGain.gain.value = vel * 0.25;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.05);
    g.gain.setValueAtTime(vel, t + dur - 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    am.connect(amGain);
    amGain.connect(g.gain);
    const mix = ctx.createGain();
    mix.gain.value = 0.5;
    o1.connect(mix);
    o2.connect(mix);
    mix.connect(bp);
    bp.connect(g);
    g.connect(out);
    [o1, o2, am].forEach((o) => {
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  private carPass() {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.05;
    const dur = rand(2.6, 3.6);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(260, t);
    bp.frequency.linearRampToValueAtTime(820, t + dur * 0.5);
    bp.frequency.linearRampToValueAtTime(240, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner();
    const dir = Math.random() < 0.5 ? -1 : 1;
    p.pan.setValueAtTime(-0.8 * dir, t);
    p.pan.linearRampToValueAtTime(0.8 * dir, t + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(p);
    p.connect(this.streetBus);
    src.start(t, rand(0, 3));
    src.stop(t + dur + 0.05);
  }

  /* ------------------------------------------------------------ */
  /* Olaylar                                                       */
  /* ------------------------------------------------------------ */

  /** Dükkân kapısı zili: iki vuruş, uyumsuz kısmi tonlar. */
  doorBell() {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.02;
    [0, 0.17].forEach((off, k) => {
      const t = t0 + off;
      const base = k ? 1980 : 2150;
      [1, 1.51, 2.02, 2.76].forEach((r, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = base * r;
        const g = ctx.createGain();
        const v = (k ? 0.05 : 0.07) / (i + 1);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4 / (1 + i * 0.4));
        o.connect(g);
        g.connect(this.fxBus);
        o.start(t);
        o.stop(t + 1.5);
      });
    });
  }

  /** Espresso makinesi: pompa uğultusu + buhar. */
  coffee() {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;
    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 52;
    const hlp = ctx.createBiquadFilter();
    hlp.type = 'lowpass';
    hlp.frequency.value = 240;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.0001, t);
    hg.gain.exponentialRampToValueAtTime(0.09, t + 0.3);
    hg.gain.setValueAtTime(0.09, t + 2.2);
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    hum.connect(hlp);
    hlp.connect(hg);
    hg.connect(this.fxBus);
    hum.start(t);
    hum.stop(t + 2.7);

    const st = ctx.createBufferSource();
    st.buffer = this.noise;
    st.loop = true;
    const shp = ctx.createBiquadFilter();
    shp.type = 'bandpass';
    shp.frequency.value = 5200;
    shp.Q.value = 0.7;
    const sgn = ctx.createGain();
    const s0 = t + 2.0;
    sgn.gain.setValueAtTime(0.0001, s0);
    sgn.gain.exponentialRampToValueAtTime(0.06, s0 + 0.4);
    sgn.gain.setValueAtTime(0.06, s0 + 1.6);
    sgn.gain.exponentialRampToValueAtTime(0.0001, s0 + 2.2);
    st.connect(shp);
    shp.connect(sgn);
    sgn.connect(this.fxBus);
    st.start(s0, rand(0, 2));
    st.stop(s0 + 2.3);
  }

  /** Sesli bir video oynarken ortam sesini kısar. */
  duck(on: boolean) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.06 : 1.15, t, on ? 0.15 : 0.8);
  }

  /** İmleç bir butonun üzerine gelince kısa makine vızıltısı. */
  hoverBuzz() {
    if (!this.on || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastHover < 140) return;
    this.lastHover = now;
    this.clipper(this.ctx.currentTime + 0.01, 0.16, 0.06, 0, this.fxBus);
  }

  /* ------------------------------------------------------------ */
  /* Kaydırmaya bağlı karışım                                      */
  /* ------------------------------------------------------------ */

  /**
   * @param p      tur ilerlemesi (0–1)
   * @param inTour tur bölümü hâlâ ekranda mı
   * @param doorAt kapıdan geçiş anı (tur ilerlemesi)
   */
  setPosition(p: number, inTour: boolean, doorAt: number) {
    const smooth = (a: number, b: number, v: number) => {
      const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    if (inTour) {
      this.streetLevel = 1 - smooth(doorAt - 0.05, doorAt + 0.08, p);
      this.salonLevel = smooth(doorAt - 0.02, doorAt + 0.12, p);
      if (this.lastP < doorAt && p >= doorAt) this.doorBell();
    } else {
      this.streetLevel = 0;
      this.salonLevel = 0.75;
    }
    this.lastP = inTour ? p : 1;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.streetBus.gain.setTargetAtTime(this.streetLevel, t, 0.25);
    this.salonBus.gain.setTargetAtTime(this.salonLevel, t, 0.35);
  }
}

export const soundscape = new Soundscape();
