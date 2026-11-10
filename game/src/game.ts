import * as THREE from 'three';
import type { Audio } from './audio';
import { ALOOF, NEEDS_LEGS } from './character/acting';
import { Character } from './character/character';
import type { CharacterDef } from './characters';
import { Dialogue, type DialogueEvent } from './dialogue';
import { Director, type Shot } from './director';
import { Film } from './film';
import { Gibs, Particles, Reels } from './fx';
import type { UI } from './ui';
import { ViewModel } from './viewmodel';
import { WEAPONS, type WeaponDef } from './weapons';

/**
 * Oyunun kuralı: karakteri ÖLDÜRMEDEN max win'i koparmak.
 *  - Her vuruş karakteri sıkıştırır (baskı) ve verdiği çarpan basamak basamak yükselir.
 *  - Her vuruş canını da götürür: kafa çok, gövde orta, uzuvlar az. Can biterse ölür ve
 *    ölü maskot ödeme yapmaz — kasa kazanır.
 *  - Oyuncu durursa baskı düşer, çarpan geri iner (karakter yine kibirlenir).
 *  - Oyuncu istediği an o anki çarpanı alıp çıkabilir.
 */
const LADDER = [2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500];
/** Basamağa göre jeton ödülü (alıp çıkınca). */
const REWARD = [10, 25, 50, 90, 140, 200, 280, 380, 500, 650];
const MAX_REWARD = 1500;
const PRESSURE_MAX = 100;
/** Oyuncu gözünden oynarken vuruş menzili (metre). Tabancanın menzili sınırsız. */
const REACH_FIST = 2.5;
const REACH_BLADE = 3.0;
const WALK_SPEED = 2.4;
/** Oyuncu bu kadar süre hareketsiz ve saldırısız kalırsa kamera yeniden yönetmene geçer (sn). */
const IDLE_TO_CINEMA = 9;
const SEVER_PRESSURE = 14;
const DECAY_DELAY = 2.5; // son vuruştan sonra baskının düşmeye başlaması (sn)
const DECAY_RATE = 1.6; // baskı / sn
type Outcome = 'maxwin' | 'cashout' | 'death';
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

/**
 * Film üç perde: karakterin canı azaldıkça oyunculuğu, replikleri ve kamera dili değişir.
 * I. perdede kamera karakteri alttan, heybetli gösterir; III. perdede tepeden ve uzaktan, küçücük.
 */
const ACTS: { no: string; name: string; sub: string; behaviors: string[]; shots: Shot[] }[] = [
  {
    no: 'I', name: 'Kibir', sub: 'kasa hep kazanır',
    behaviors: ['smug', 'shrug', 'point', 'clap', 'turnAway', 'pace', 'nails'],
    shots: ['wide', 'low', 'orbit', 'close'],
  },
  {
    no: 'II', name: 'Öfke', sub: 'kaybetmeyi bilmeyen oynamasın',
    behaviors: ['scold', 'guard', 'stagger', 'shrug', 'point'],
    shots: ['dutch', 'close', 'orbit', 'low'],
  },
  {
    no: 'III', name: 'Yakarış', sub: 'makaralar durunca',
    behaviors: ['plead', 'cower', 'retreat', 'guard'],
    shots: ['top', 'far', 'close', 'dutch'],
  },
];

interface Drip {
  parent: THREE.Object3D;
  local: THREE.Vector3;
  until: number;
}

export class Game {
  coins = 0;
  owned = new Set<string>(['fist']);
  weapon: WeaponDef = WEAPONS[0];
  /** Bakiye / silah durumu değişince çağrılır (kaydetme + arayüz). */
  onChange: () => void = () => {};

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.05, 80);
  private director = new Director(this.camera);
  private film: Film;
  private raycaster = new THREE.Raycaster();
  private lastFrame = performance.now();

  private character: Character | null = null;
  private state: 'idle' | 'fight' | 'ended' = 'idle';
  private outcome: Outcome | null = null;
  private dialogue: Dialogue | null = null;
  /** 0..100: karakterin ne kadar sıkıştığı. Çarpanı ve perdeyi bu belirler. */
  private pressure = 0;
  private offer = 0;
  private lastHitAt = 0;
  private lastSpot = '';
  private sameSpot = 0;
  private introAt = 0;
  private act = 0;
  private particles: Particles;
  private gibs: Gibs;
  private reels = new Reels();
  private rim = new THREE.PointLight(0xffffff, 14, 12);
  private dust: THREE.Points;
  private drips: Drip[] = [];

  private view = new ViewModel(this.camera);
  private lastAttack = 0;

  private ndc = new THREE.Vector2(0, 0);
  private down = false;
  private lastX = 0;
  private lastY = 0;
  private pendingSlash: { x: number; y: number; dx: number; dy: number } | null = null;
  private stroke = new Set<string>();
  private trail: { x: number; y: number; t: number }[] = [];
  private trailCtx: CanvasRenderingContext2D;

  /** Gerçek zaman (sn). Oyun zamanı ağır çekimde yavaşlar, bu yavaşlamaz. */
  private now = 0;
  private timeScale = 1;
  private slowUntil = 0;
  private slowScale = 1;
  private freezeUntil = 0;
  private blockUntil = 0;
  private shake = 0;
  private beatTimer = 2;
  private shotTimer = 8;
  private pendingShot: { at: number; shot: Shot | null } | null = null;
  private severs = 0;
  private farHintAt = 0;
  /** Oyuncu sahnede yürüyerek mi oynuyor (kamera onun gözü). */
  private walking = false;
  private keys = new Set<string>();
  /** Dokunmatik kumanda çubuğu: x = sağa, y = ileri (-1..1). */
  stick = { x: 0, y: 0 };
  private lastMoveAt = 0;
  private stride = 0;
  private thudAt = 0;
  private endAt = 0;

  constructor(private canvas: HTMLCanvasElement, trailCanvas: HTMLCanvasElement, private ui: UI, private audio: Audio) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.trailCtx = trailCanvas.getContext('2d')!;
    this.film = new Film(this.renderer, this.scene, this.camera);

    // Sahne: karanlık bir boşluk, tek bir sert spot, arkada titreyen slot ekranı.
    const s = this.scene;
    s.background = new THREE.Color(0x000000);
    s.fog = new THREE.FogExp2(0x000000, 0.05);
    s.add(this.camera);
    s.add(new THREE.HemisphereLight(0xdfe6ff, 0x101018, 0.5));

    const keyPos = new THREE.Vector3(1.8, 6.5, 2.6);
    const key = new THREE.SpotLight(0xfff4e0, 95, 0, 0.36, 0.6, 1.6);
    key.position.copy(keyPos);
    key.target.position.set(0, 0.9, -0.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0005;
    s.add(key, key.target);

    // Işığın içinde süzülen toz.
    const dustPos = new Float32Array(110 * 3);
    for (let i = 0; i < 110; i++) {
      dustPos.set([(Math.random() - 0.5) * 3.2, Math.random() * 4.5, (Math.random() - 0.5) * 3.2], i * 3);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    this.dust = new THREE.Points(
      dg,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.014, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    s.add(this.dust);

    this.rim.position.set(0, 2.2, -2.6);
    s.add(this.rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(16, 64).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.8, metalness: 0 }),
    );
    floor.receiveShadow = true;
    s.add(floor);

    this.reels.mesh.position.set(0, 2.3, -3.4);
    this.reels.mesh.scale.setScalar(1.25);
    s.add(this.reels.mesh);

    this.particles = new Particles(s);
    this.gibs = new Gibs(s);
    this.setWeaponModel();

    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onUp);
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (MOVE_KEYS.has(k)) {
        this.keys.add(k);
        if (k.startsWith('arrow')) e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('resize', this.resize);
    this.resize();
    this.renderer.setAnimationLoop(this.frame);
  }

  // ---------------------------------------------------------------- akış

  async start(def: CharacterDef) {
    this.character?.dispose();
    this.character = null;
    this.gibs.clear();
    this.particles.clear();
    this.drips = [];
    this.state = 'idle';

    const ch = await Character.create(def);
    this.character = ch;
    this.scene.add(ch.root);
    this.reels.setTheme(def.symbols, def.theme);
    this.rim.color.set(def.theme.accent);
    this.ui.setCharacter(def, ch.usingPlaceholder);
    this.ui.setHp(1);
    this.ui.subtitle(null);

    this.act = 0;
    this.severs = 0;
    this.slowUntil = this.freezeUntil = 0;
    this.pendingShot = null;
    this.walking = false;
    this.director.player.set(0, 0, 4.2);
    this.endAt = 0;
    this.outcome = null;
    this.pressure = 0;
    this.offer = 0;
    this.showOffer();

    this.dialogue?.stop();
    this.dialogue = new Dialogue(def, def.lines, this.audio);
    this.dialogue.onSpeak = (text, seconds) => {
      this.ui.subtitle(text, seconds);
      ch.talk(text, seconds);
      this.reels.spin();
      this.beatTimer = seconds + 2 + Math.random() * 2.5;
    };

    this.state = 'fight';
    ch.act('smug');
    this.director.cut('wide');
    this.shotTimer = 10;
    this.openAct(def.slotName, def.name, 3.2);
    this.beatTimer = 99;
    this.introAt = this.blockUntil; // ara yazı açılırken: övünür ve ilk çarpanı gösterir
    this.audio.startMusic();
  }

  stop() {
    this.state = 'idle';
    this.dialogue?.stop();
    this.ui.subtitle(null);
  }

  /** Oyuncu o anki çarpanı alıp çıkar. */
  cashOut() {
    if (this.state === 'fight' && this.character && this.now >= this.blockUntil) this.finish(this.character, 'cashout');
  }

  private showOffer() {
    this.reels.setOffer(`${LADDER[this.offer]}x`);
    this.ui.setOffer(LADDER[this.offer], REWARD[this.offer]);
  }

  private speak(event: DialogueEvent, force = false): boolean {
    return this.dialogue?.trigger(event, force) ?? false;
  }

  /** Perde ara yazısı: ekran kararır, başlık görünür, tek bir çan vurur. */
  private openAct(top: string, main: string, seconds: number) {
    const A = ACTS[this.act];
    this.ui.setAct(`${A.no}. perde`);
    this.ui.card(top, main, `${A.no}. ${A.name} — ${A.sub}`, seconds);
    this.audio.toll();
    this.blockUntil = this.now + seconds * 0.7;
    this.beatTimer = seconds * 0.85;
  }

  /** Silahı seçer; sahip değilse ve para yetiyorsa satın alır. */
  selectWeapon(id: string): boolean {
    const w = WEAPONS.find((x) => x.id === id);
    if (!w) return false;
    if (!this.owned.has(id)) {
      if (this.coins < w.price) return false;
      this.coins -= w.price;
      this.owned.add(id);
      this.audio.coin();
    }
    const changed = this.weapon !== w;
    this.weapon = w;
    this.setWeaponModel();
    this.onChange();
    // Karakter eline ne aldığını görür ve ona göre konuşur.
    if (changed && this.state === 'fight' && id !== 'fist') this.speak(`weapon_${id}` as DialogueEvent);
    return true;
  }

  private setWeaponModel() {
    this.view.setWeapon(this.weapon);
  }

  /** Bir "vuruş": karakter yeni bir davranışa geçer ve oyuncuyu kışkırtır. */
  private beat(ch: Character) {
    if (!this.speak(`idle_${this.act + 1}` as DialogueEvent, true)) {
      this.beatTimer = 1.5; // şu an başka bir şey söylüyor: birazdan yeniden dene
      return;
    }
    const A = ACTS[this.act];
    const options = A.behaviors.filter((b) => b !== ch.behaviorName && (ch.canWalk || !NEEDS_LEGS.has(b)));
    if (this.act >= 1 && ch.lostArm && Math.random() < 0.35) ch.act('lookStump');
    else if (options.length) ch.act(pick(options));
  }

  private cutTo(shot?: Shot) {
    // Oyuncu yürüyerek oynuyorsa kamera onun gözüne döner; yönetmen yalnızca özel anlarda keser.
    if (this.walking) {
      this.director.cut('player');
      return;
    }
    const shots = ACTS[this.act].shots.filter((s) => s !== this.director.shot);
    this.director.cut(shot ?? pick(shots));
    this.shotTimer = 7 + Math.random() * 5;
  }

  private slow(scale: number, seconds: number) {
    this.slowScale = scale;
    this.slowUntil = this.now + seconds;
  }

  // ---------------------------------------------------------------- girdi

  private onDown = (e: PointerEvent) => {
    this.audio.unlock();
    this.canvas.setPointerCapture(e.pointerId);
    this.down = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.setNdc(e.clientX, e.clientY);
    this.stroke.clear();
    this.trail.length = 0;
    this.attack(e.clientX, e.clientY);
  };

  private onMove = (e: PointerEvent) => {
    this.setNdc(e.clientX, e.clientY);
    if (!this.down || this.weapon.kind !== 'slash') return;
    this.trail.push({ x: e.clientX, y: e.clientY, t: this.now });
    const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
    if (dx * dx + dy * dy < 100) return;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    // Skinned mesh raycast'i pahalı: karede en fazla bir örnek işlenir.
    this.pendingSlash = { x: e.clientX, y: e.clientY, dx, dy };
  };

  private onUp = () => {
    this.down = false;
    this.pendingSlash = null;
  };

  private setNdc(x: number, y: number) {
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  }

  /**
   * Oyuncunun yürümesi (WASD / ok tuşları / dokunmatik çubuk). Bakış maskota kilitlidir:
   * ileri-geri yaklaşıp uzaklaşır, sağ-sol etrafında döner.
   */
  private movePlayer(ch: Character, real: number) {
    const k = this.keys;
    let f = this.stick.y + (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
    let r = this.stick.x + (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
    const len = Math.hypot(f, r);
    const p = this.director.player;

    if (len > 0.05 && this.state === 'fight') {
      if (len > 1) {
        f /= len;
        r /= len;
      }
      this.lastMoveAt = this.now;
      if (!this.walking) {
        this.walking = true;
        if (!this.pendingShot) this.director.cut('player');
      }
      const body = ch.bodyPosition(_a);
      const to = _b.set(body.x - p.x, 0, body.z - p.z);
      const dist = to.length() || 1;
      to.divideScalar(dist);
      const step = WALK_SPEED * real;
      // İleri: maskota doğru. Sağ: bakış yönünün sağı.
      p.x += (to.x * f - to.z * r) * step;
      p.z += (to.z * f + to.x * r) * step;
      this.stride += step * 4.2;
      // Maskotun içine girme; sahnenin ve arkadaki ekranın dışına çıkma.
      const dx = p.x - body.x, dz = p.z - body.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.15) {
        p.x = body.x + (dx / (d || 1)) * 1.15;
        p.z = body.z + (dz / (d || 1)) * 1.15;
      }
      const far = Math.hypot(p.x, p.z);
      if (far > 6.5) p.multiplyScalar(6.5 / far);
      p.z = Math.max(p.z, -2.4);
    } else if (this.walking && this.state === 'fight' &&
      this.now - Math.max(this.lastMoveAt, this.lastAttack) > IDLE_TO_CINEMA && !this.pendingShot) {
      // Oyuncu durdu: kamera yeniden yönetmene geçer. İlk tuşta geri döner.
      this.walking = false;
      this.cutTo();
    }
    this.director.playerBob = Math.sin(this.stride) * 0.035 * Math.min(1, len);
  }

  // ---------------------------------------------------------------- saldırı

  private attack(x: number, y: number, drag?: { dx: number; dy: number }) {
    const ch = this.character;
    if (!ch || ch.dead || this.state !== 'fight' || this.now < this.blockUntil) return;
    const w = this.weapon;
    if (!drag) {
      if (this.now - this.lastAttack < w.cooldown) return;
      this.lastAttack = this.now;
    }

    this.setNdc(x, y);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const ray = this.raycaster.ray;
    const hit = ch.raycast(ray);

    if (!drag) {
      this.view.strike(hit ? hit.point : ray.at(4, _a));
      if (w.kind === 'shot') this.audio.shot();
      else if (w.cauterize) this.audio.saber();
      else this.audio.swing();
    }
    // Oyuncu kendi gözünden oynuyorsa yumruk ve kılıç ancak yakından isabet eder.
    const tooFar = !!hit && this.director.shot === 'player' && w.kind !== 'shot' &&
      hit.point.distanceTo(this.camera.position) > (w.kind === 'slash' ? REACH_BLADE : REACH_FIST);
    if (!hit || tooFar) {
      this.stroke.clear(); // boşa çıkan kesik: aynı parçaya geri dönüp tekrar kesebilsin
      if (!drag) this.speak('miss');
      if (tooFar && this.now > this.farHintAt) {
        this.farHintAt = this.now + 4;
        this.ui.toast('çok uzaksın — yaklaş');
      }
      return;
    }

    const part = hit.part;
    if (w.kind === 'slash') {
      const key = part ?? 'torso';
      if (this.stroke.has(key)) return;
      this.stroke.add(key);
      if (drag) this.view.strike(hit.point);
    }

    const dir = ray.direction.clone();
    if (drag) {
      const right = _a.setFromMatrixColumn(this.camera.matrixWorld, 0);
      const up = _b.setFromMatrixColumn(this.camera.matrixWorld, 1);
      dir.copy(_c.copy(right).multiplyScalar(drag.dx).addScaledVector(up, -drag.dy).normalize().addScaledVector(ray.direction, 0.4));
    } else {
      dir.x += (Math.random() - 0.5) * 0.5;
    }
    dir.normalize();

    const res = ch.hit({ point: hit.point, dir, part, weapon: w });
    const blood = ch.def.bloodColor;
    const back = _a.copy(ray.direction).multiplyScalar(-0.6);

    if (w.kind === 'blunt') {
      this.audio.punch(w.id !== 'fist');
      this.particles.emit(hit.point, back, w.id === 'fist' ? 3 : 8, blood, 2);
    } else if (w.cauterize) {
      this.particles.emit(hit.point, dir, 14, 0xffa030, 3);
    } else if (w.kind === 'slash') {
      this.audio.slash();
      this.particles.emit(hit.point, dir, 16, blood, 3.5);
    } else {
      this.audio.punch();
      this.particles.emit(hit.point, back, 12, blood, 3);
    }

    this.shake = Math.min(0.1, this.shake + w.force * 0.004);
    if (res.crit) this.freezeUntil = this.now + 0.07; // kafaya isabet: bir anlık donma
    this.lastHitAt = this.now;
    // Baskı: uzuvlara vurmak hem daha çok sıkıştırır hem daha az can götürür. Aynı yere üst üste
    // vurmak ise gittikçe daha az işe yarar (alışır): oyuncu hedef değiştirmek zorunda.
    const spot = part ?? 'body';
    this.sameSpot = spot === this.lastSpot ? this.sameSpot + 1 : 0;
    this.lastSpot = spot;
    this.pressure += w.fear * (res.zone === 'limb' ? 1 : 0.6) * Math.max(0.3, Math.pow(0.82, this.sameSpot));

    // Karakter seni umursamıyorken vurulduysa: sahnesi bozulur, döner ve tepki verir.
    if (!res.killed && ALOOF.has(ch.behaviorName)) {
      ch.act(this.act === 0 ? 'scold' : 'guard');
      this.speak('aloof_hit', true);
    }

    const sev = res.severed;
    if (sev) {
      this.severs++;
      this.audio.sever();
      this.shake = 0.16;
      this.film.flash = 0.22;
      this.slow(0.13, 1.15); // kopuş ağır çekimde izlenir
      if (sev.gib && sev.ragdoll && sev.gibRoot) {
        // Parça darbenin yönünde fırlar ve havada döner; gerisini fizik halleder.
        const vel = dir.clone().multiplyScalar(2.4);
        vel.y += 3.4;
        vel.x += (Math.random() - 0.5) * 1.5;
        sev.ragdoll.launch(vel, new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(11));
        this.gibs.add(sev.gib, sev.ragdoll);
        // Kopan uzuv da kanar: kesik ucundan iz bırakır.
        if (!w.cauterize) this.drips.push({ parent: sev.gibRoot, local: new THREE.Vector3(), until: this.now + 2.2 });
        // Kamera kopan parçaya keser ve onu havada izler.
        if (this.severs === 1 || sev.part === 'head' || Math.random() < 0.5) {
          this.onUp(); // kesme anında kılıç darbesi biter
          this.director.cut('impact', sev.gibRoot);
          this.pendingShot = { at: this.now + 1.3, shot: null };
        }
      }
      if (w.cauterize) this.particles.emit(sev.joint, dir, 26, 0xffa030, 3.5, 0.9);
      else {
        this.particles.emit(sev.joint, dir, 45, blood, 4, 0.9);
        this.drips.push({ parent: sev.stumpParent, local: sev.stumpLocal, until: this.now + 7 });
      }
      this.pressure += SEVER_PRESSURE;
      if (!res.killed) {
        if (this.act >= 1 && sev.part.includes('arm')) ch.act('lookStump');
        this.speak(sev.part.includes('arm') ? 'sever_arm' : 'sever_leg', true);
      }
    } else if (!res.killed) {
      this.speak(res.zone === 'limb' ? (part!.includes('arm') ? 'hit_arm' : 'hit_leg') : `hit_${res.zone}`);
    }

    this.ui.setHp(ch.hp / ch.maxHp);
    if (res.killed) return this.finish(ch, 'death');
    if (ch.hp / ch.maxHp < 0.25) this.speak('near_death');
    this.updateOffer(ch);
  }

  /** Baskıya göre çarpan basamağını, perdeyi ve max win'i günceller. */
  private updateOffer(ch: Character) {
    this.pressure = Math.max(0, this.pressure);
    if (this.pressure >= PRESSURE_MAX) return this.finish(ch, 'maxwin');

    const idx = Math.min(LADDER.length - 1, Math.floor((this.pressure / PRESSURE_MAX) * LADDER.length));
    if (idx > this.offer) {
      this.audio.coin();
      this.film.flash = Math.max(this.film.flash, 0.08);
      this.speak(idx <= 3 ? 'offer_small' : idx <= 6 ? 'offer_mid' : 'offer_big', true);
      if (this.act === 0) ch.act('present'); // yeni çarpanı gururla gösterir
    } else if (idx < this.offer) {
      this.speak('recover');
    }
    if (idx !== this.offer) {
      this.offer = idx;
      this.showOffer();
    }

    const act = this.pressure >= 70 ? 2 : this.pressure >= 35 ? 1 : 0;
    if (act > this.act) {
      this.act = act;
      this.openAct(ch.def.name, ACTS[act].name, 2.6);
      ch.act(act === 1 ? (ch.canWalk ? 'stagger' : 'guard') : 'plead');
      this.pendingShot = null;
      this.cutTo(ACTS[act].shots[0]); // yürüyerek oynanıyorsa oyuncunun gözünde kalır
    }
  }

  /** Sahnenin sonu: max win, alıp çıkma ya da ölüm. */
  private finish(ch: Character, outcome: Outcome) {
    this.state = 'ended';
    this.outcome = outcome;
    this.ui.hideOffer();
    this.onUp();
    this.speak(outcome, true);

    if (outcome === 'maxwin') {
      this.coins += MAX_REWARD;
      ch.act('plead');
      this.film.flash = 0.35;
      this.shake = 0.2;
      this.slow(0.35, 3);
      window.setTimeout(() => this.audio.win(), 1500);
      this.endAt = this.now + 4.6;
    } else if (outcome === 'cashout') {
      this.coins += REWARD[this.offer];
      this.audio.coin();
      ch.act(this.act === 0 ? 'clap' : 'shrug');
      this.endAt = this.now + 3.4;
    } else {
      this.film.flash = 0.3;
      this.shake = 0.2;
      this.slow(0.2, 3.6); // düşüş ağır çekimde
      this.endAt = this.now + 4.8;
    }

    // Kafa koptuysa önce onu izle, sonra kapanış planı.
    const shot: Shot = outcome === 'cashout' ? 'close' : 'finale';
    if (this.director.shot === 'impact') this.pendingShot = { at: this.now + 1.3, shot };
    else {
      this.pendingShot = null;
      this.director.cut(shot);
    }
    this.onChange();
  }

  // ---------------------------------------------------------------- kare

  private frame = () => {
    const t = performance.now();
    const real = Math.max(0, Math.min((t - this.lastFrame) / 1000, 0.1));
    this.lastFrame = t;
    this.now += real;

    // Zaman: ağır çekim ve darbe donması.
    const target = this.now < this.freezeUntil ? 0.02 : this.now < this.slowUntil ? this.slowScale : 1;
    this.timeScale += (target - this.timeScale) * Math.min(1, real * (target < this.timeScale ? 40 : 4));
    const dt = real * this.timeScale;
    const ch = this.character;

    if (this.pendingSlash) {
      const p = this.pendingSlash;
      this.pendingSlash = null;
      this.attack(p.x, p.y, p);
    }

    if (ch) {
      ch.setMood(this.outcome === 'cashout' ? 'smug' : this.outcome === 'maxwin' ? 'fear' : (['smug', 'angry', 'fear'] as const)[this.act]);
      this.movePlayer(ch, real);
      ch.update(dt, this.camera.position, this.audio.voiceLevel(), this.walking ? this.director.player : null);
      this.dialogue?.update(real);

      if (this.state === 'fight') {
        if (this.introAt && this.now >= this.introAt) {
          this.introAt = 0;
          ch.act('present');
          this.speak('intro', true);
        }
        this.beatTimer -= real;
        if (this.beatTimer <= 0) this.beat(ch);
        // Oyuncu durunca karakter toparlanır: baskı düşer, çarpan geri iner.
        if (this.pressure > 0 && this.now - this.lastHitAt > DECAY_DELAY && this.now > this.blockUntil) {
          this.pressure -= DECAY_RATE * real;
          this.updateOffer(ch);
        }
        this.shotTimer -= real;
        if (this.shotTimer <= 0 && !this.walking && !this.down && !this.pendingShot && this.now > this.slowUntil) this.cutTo();
      }
      if (this.pendingShot && this.now >= this.pendingShot.at) {
        const shot = this.pendingShot.shot;
        this.pendingShot = null;
        if (shot) this.director.cut(shot);
        else this.cutTo();
      }
      if (this.state === 'ended' && this.endAt && this.now >= this.endAt && this.outcome) {
        this.endAt = 0;
        const reward = this.outcome === 'maxwin' ? MAX_REWARD : this.outcome === 'cashout' ? REWARD[this.offer] : 0;
        this.ui.showEnd(this.outcome, ch.def, LADDER[this.offer], reward);
      }
      if (this.outcome === 'maxwin' && this.state === 'ended' && Math.random() < 0.7) {
        // Max win: karanlıkta tek renk olarak altın yağar.
        _a.set((Math.random() - 0.5) * 3, 5.5, (Math.random() - 0.5) * 2).add(ch.root.position);
        this.particles.emit(_a, _b.set(0, -0.4, 0), 2, 0xffd23f, 1.2, 0.5);
      }
      // Beden ya da kopan bir parça yere çarptı: boğuk bir ses, hafif sarsıntı.
      if (ch.consumeThud()) {
        this.audio.thud(true);
        this.shake = Math.max(this.shake, 0.09);
      }
      this.director.update(real, ch.bodyPosition(_b), ch.headPosition(_a));
    }

    // Kan nabızla atar: her kalp atışında fışkırır, zamanla zayıflar.
    this.drips = this.drips.filter((d) => d.until > this.now);
    const beat = Math.pow(Math.max(0, Math.sin(this.now * 11)), 6);
    for (const d of this.drips) {
      const left = Math.min(1, (d.until - this.now) / 4);
      if (Math.random() < (0.15 + 0.85 * beat) * left * (0.25 + 0.75 * this.timeScale)) {
        const pos = d.parent.localToWorld(_a.copy(d.local));
        this.particles.emit(pos, _b.set(0, 0.2 * beat, 0), beat > 0.5 ? 2 : 1, ch?.def.bloodColor ?? 0xc8102e, 0.8 + 1.6 * beat * left, 0.5);
      }
    }

    this.particles.update(dt);
    this.gibs.update(dt);
    if (this.gibs.impact > 2.2 && this.now > this.thudAt) {
      this.thudAt = this.now + 0.12;
      this.audio.thud();
    }
    this.reels.update(dt);
    this.dust.rotation.y += real * 0.03;
    // Arkadaki ekran eski bir televizyon gibi titrer.
    const flick = 0.3 + 0.05 * Math.sin(this.now * 31) * Math.sin(this.now * 7.3) + (Math.random() < 0.02 ? -0.12 : 0);
    (this.reels.mesh.material as THREE.MeshBasicMaterial).color.setScalar(flick);
    this.rim.intensity = 30 * flick;

    this.shake *= Math.exp(-9 * real);
    this.camera.position.x += (Math.random() - 0.5) * this.shake;
    this.camera.position.y += (Math.random() - 0.5) * this.shake;
    this.camera.updateMatrixWorld();

    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.view.update(real, {
      pov: this.director.shot === 'player',
      ray: this.raycaster.ray,
      holding: this.weapon.kind === 'slash' && this.down,
      bob: this.director.playerBob,
    });
    this.drawTrail();
    this.film.render(real);
  };

  private drawTrail() {
    const c = this.trailCtx;
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    this.trail = this.trail.filter((p) => this.now - p.t < 0.3);
    if (this.trail.length < 2) return;
    const color = this.weapon.color !== undefined ? `#${this.weapon.color.toString(16).padStart(6, '0')}` : '#ffffff';
    c.lineCap = 'round';
    c.strokeStyle = color;
    c.shadowColor = color;
    c.shadowBlur = 14;
    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1], b = this.trail[i];
      const life = 1 - (this.now - b.t) / 0.3;
      c.globalAlpha = life;
      c.lineWidth = 1 + 6 * life;
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  private resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.film.setSize(w, h, pr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.trailCtx.canvas.width = w;
    this.trailCtx.canvas.height = h;
  };
}
