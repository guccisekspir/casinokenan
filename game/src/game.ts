import * as THREE from 'three';
import type { Audio } from './audio';
import { Character } from './character/character';
import { PART_LABEL } from './character/rig';
import type { CharacterDef } from './characters';
import { Gibs, Particles, Reels } from './fx';
import type { UI } from './ui';
import { buildViewModel, WEAPONS, type WeaponDef } from './weapons';

const WIN_BONUS = 500;
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

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
  private camera = new THREE.PerspectiveCamera(45, 1, 0.05, 60);
  private camBase = new THREE.Vector3(0, 1.45, 4.6);
  private raycaster = new THREE.Raycaster();
  private lastFrame = performance.now();

  private character: Character | null = null;
  private state: 'idle' | 'fight' | 'won' = 'idle';
  private particles: Particles;
  private gibs: Gibs;
  private reels = new Reels();
  private drips: Drip[] = [];

  private vm: THREE.Group | null = null;
  private strikeT = 1;
  private strikeTarget = new THREE.Vector3(0, 1.2, 0);
  private lastAttack = 0;

  private ndc = new THREE.Vector2(0, 0);
  private down = false;
  private lastX = 0;
  private lastY = 0;
  private pendingSlash: { x: number; y: number; dx: number; dy: number } | null = null;
  private stroke = new Set<string>();
  private trail: { x: number; y: number; t: number }[] = [];
  private trailCtx: CanvasRenderingContext2D;

  private shake = 0;
  private tauntTimer = 2;
  private lineCooldown = 0;
  private now = 0;

  constructor(private canvas: HTMLCanvasElement, trailCanvas: HTMLCanvasElement, private ui: UI, private audio: Audio) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.trailCtx = trailCanvas.getContext('2d')!;

    const s = this.scene;
    s.background = new THREE.Color(0x120a24);
    s.fog = new THREE.Fog(0x120a24, 8, 22);
    s.add(this.camera);
    s.add(new THREE.HemisphereLight(0xffffff, 0x43306b, 1.3));
    const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
    sun.position.set(2.5, 5, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: 0.5, far: 14 });
    s.add(sun);
    const rim = new THREE.PointLight(0xff4fd8, 30, 9);
    rim.position.set(-2.5, 2.5, -1.2);
    s.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 48).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x2a1c48, roughness: 0.55, metalness: 0.2 }),
    );
    floor.receiveShadow = true;
    s.add(floor);
    this.reels.mesh.position.set(0, 2.05, -2.4);
    s.add(this.reels.mesh);

    this.particles = new Particles(s);
    this.gibs = new Gibs(s);
    this.setWeaponModel();

    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onUp);
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
    this.ui.setCharacter(def, ch.usingPlaceholder);
    this.ui.setHp(1);
    this.state = 'fight';
    this.tauntTimer = 1;
  }

  stop() {
    this.state = 'idle';
    window.speechSynthesis?.cancel();
    this.ui.bubble(null);
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
    this.weapon = w;
    this.setWeaponModel();
    this.onChange();
    return true;
  }

  private setWeaponModel() {
    this.vm?.removeFromParent();
    this.vm = buildViewModel(this.weapon);
    this.vm.scale.setScalar(0.62);
    this.vm.position.set(0.42, -0.4, -0.95);
    this.camera.add(this.vm);
  }

  private say(text: string) {
    const ch = this.character;
    if (!ch) return;
    const dur = 1.3 + text.length * 0.055;
    this.ui.bubble(text, dur);
    this.audio.speak(text, ch.def.voice);
    ch.talk(dur);
    this.reels.spin();
    this.tauntTimer = dur + 2.5 + Math.random() * 2.5;
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

  // ---------------------------------------------------------------- saldırı

  private attack(x: number, y: number, drag?: { dx: number; dy: number }) {
    const ch = this.character;
    if (!ch || ch.dead || this.state !== 'fight') return;
    const w = this.weapon;
    if (!drag) {
      if (this.now - this.lastAttack < w.cooldown) return;
      this.lastAttack = this.now;
    }

    this.setNdc(x, y);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const ray = this.raycaster.ray;
    const hit = this.raycaster.intersectObjects(ch.meshes, false)[0];

    if (!drag) {
      this.strikeT = 0;
      this.strikeTarget.copy(hit ? hit.point : ray.at(4, _a));
      if (w.kind === 'shot') this.audio.shot();
      else if (w.cauterize) this.audio.saber();
      else this.audio.swing();
    }
    if (!hit) {
      this.stroke.clear(); // boşa çıkan kesik: aynı parçaya geri dönüp tekrar kesebilsin
      return;
    }

    const part = ch.partFromHit(hit);
    if (w.kind === 'slash') {
      const key = part ?? 'torso';
      if (this.stroke.has(key)) return;
      this.stroke.add(key);
      if (drag) this.strikeT = 0;
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
      this.particles.emit(hit.point, back, 5, 0xffe066, 2.5);
      this.particles.emit(hit.point, back, w.id === 'fist' ? 2 : 6, blood, 2);
    } else if (w.cauterize) {
      this.particles.emit(hit.point, dir, 14, 0xffa030, 3);
    } else if (w.kind === 'slash') {
      this.audio.slash();
      this.particles.emit(hit.point, dir, 16, blood, 3.5);
    } else {
      this.audio.punch();
      this.particles.emit(hit.point, back, 12, blood, 3);
    }

    const screen = this.toScreen(hit.point);
    this.coins += res.damage;
    this.ui.floater(screen.x, screen.y, `+${res.damage}`, res.crit ? 'crit' : '');
    this.shake = Math.min(0.14, this.shake + w.force * 0.005);

    const sev = res.severed;
    if (sev) {
      this.audio.sever();
      this.shake = 0.2;
      if (sev.gib) {
        const vel = dir.clone().multiplyScalar(2.6);
        vel.y += 3.6;
        vel.x += (Math.random() - 0.5) * 1.5;
        this.gibs.add(sev.gib, vel, Math.max(0.06, sev.radius));
      }
      if (w.cauterize) this.particles.emit(sev.joint, dir, 26, 0xffa030, 3.5, 0.9);
      else {
        this.particles.emit(sev.joint, dir, 45, blood, 4, 0.9);
        this.drips.push({ parent: sev.stumpParent, local: sev.stumpLocal, until: this.now + 4 });
      }
      this.ui.floater(screen.x, screen.y - 46, `${PART_LABEL[sev.part]} KOPTU!`, 'sever');
      if (!res.killed) this.say(pick(ch.def.severLines));
    } else if (!res.killed && this.now > this.lineCooldown && Math.random() < 0.3) {
      this.lineCooldown = this.now + 2.2;
      this.say(pick(ch.hp / ch.maxHp < 0.35 ? ch.def.lowLines : ch.def.hitLines));
    }

    this.ui.setHp(ch.hp / ch.maxHp);
    if (res.killed) this.win(ch);
    this.onChange();
  }

  private win(ch: Character) {
    this.state = 'won';
    this.say(ch.def.deathLine);
    this.coins += WIN_BONUS;
    this.shake = 0.3;
    window.setTimeout(() => this.audio.win(), 500);
    window.setTimeout(() => {
      if (this.state === 'won' && this.character === ch) this.ui.showWin(ch.def, WIN_BONUS);
    }, 1700);
  }

  // ---------------------------------------------------------------- kare

  private frame = () => {
    const t = performance.now();
    const dt = Math.max(0, Math.min((t - this.lastFrame) / 1000, 0.05));
    this.lastFrame = t;
    this.now += dt;
    const ch = this.character;

    if (this.pendingSlash) {
      const p = this.pendingSlash;
      this.pendingSlash = null;
      this.attack(p.x, p.y, p);
    }

    if (ch) {
      ch.update(dt);
      if (this.state === 'fight') {
        this.tauntTimer -= dt;
        if (this.tauntTimer <= 0) this.say(pick(ch.hp / ch.maxHp < 0.35 ? ch.def.lowLines : ch.def.taunts));
      }
      if (this.state === 'won' && Math.random() < 0.6) {
        // jackpot: altın yağmuru
        _a.set((Math.random() - 0.5) * 1.2, 0.6, (Math.random() - 0.5) * 0.6).add(ch.root.position);
        this.particles.emit(_a, _b.set(0, 1.6, 0.3), 3, 0xffd23f, 3.5, 0.8);
      }
      const head = ch.headPosition(_a);
      head.y += 0.62;
      const s = this.toScreen(head);
      this.ui.bubblePos(s.x, s.y);
    }

    this.drips = this.drips.filter((d) => d.until > this.now);
    for (const d of this.drips) {
      if (Math.random() < 0.7) {
        this.particles.emit(d.parent.localToWorld(_a.copy(d.local)), _b.set(0, -0.3, 0), 1, ch?.def.bloodColor ?? 0xc8102e, 1.2, 0.5);
      }
    }

    this.particles.update(dt);
    this.gibs.update(dt);
    this.reels.update(dt);

    this.shake *= Math.exp(-9 * dt);
    this.camera.position.copy(this.camBase);
    this.camera.position.x += (Math.random() - 0.5) * this.shake;
    this.camera.position.y += (Math.random() - 0.5) * this.shake;
    this.camera.lookAt(0, 1.15, 0);
    this.camera.updateMatrixWorld();

    this.updateViewModel(dt);
    this.drawTrail();
    this.renderer.render(this.scene, this.camera);
  };

  private updateViewModel(dt: number) {
    const vm = this.vm;
    if (!vm) return;
    this.strikeT = Math.min(1, this.strikeT + dt / 0.24);
    const k = this.strikeT < 1 ? Math.sin(Math.PI * Math.pow(this.strikeT, 0.55)) : 0;
    const cam = this.camera;
    this.raycaster.setFromCamera(this.ndc, cam);
    const ray = this.raycaster.ray;
    const aim = ray.at(3.2, new THREE.Vector3());
    const rest = _b.set(cam.aspect < 0.8 ? 0.2 : 0.42, -0.4, -0.95);
    const kind = this.weapon.kind;
    let look = aim;

    if (kind === 'blunt') {
      const t = cam.worldToLocal(_c.copy(this.strikeTarget)).multiplyScalar(0.84);
      vm.position.copy(rest).lerp(t, k);
      if (k > 0) look = this.strikeTarget;
    } else if (kind === 'slash') {
      const hold = cam.worldToLocal(ray.at(1.5, _c));
      hold.y -= 0.42;
      hold.x += 0.08;
      rest.lerp(hold, this.down ? 1 : k);
      vm.position.lerp(rest, 1 - Math.exp(-28 * dt));
    } else {
      vm.position.copy(rest);
      vm.position.z += 0.14 * k;
    }

    vm.lookAt(look);
    if (kind === 'slash') vm.rotateX(-1.25 + 1.0 * k);
    if (kind === 'shot') vm.rotateX(-0.45 * k);
    const flash = vm.getObjectByName('flash');
    if (flash) flash.visible = this.strikeT < 0.3;
  }

  private drawTrail() {
    const c = this.trailCtx;
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    this.trail = this.trail.filter((p) => this.now - p.t < 0.22);
    if (this.trail.length < 2) return;
    const color = this.weapon.color !== undefined ? `#${this.weapon.color.toString(16).padStart(6, '0')}` : '#ffffff';
    c.lineCap = 'round';
    c.strokeStyle = color;
    c.shadowColor = color;
    c.shadowBlur = 14;
    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1], b = this.trail[i];
      const life = 1 - (this.now - b.t) / 0.22;
      c.globalAlpha = life;
      c.lineWidth = 2 + 9 * life;
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  private toScreen(p: THREE.Vector3) {
    const v = _c.copy(p).project(this.camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
  }

  private resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camBase.z = this.camera.aspect < 0.7 ? 5.6 : 4.6;
    this.camera.updateProjectionMatrix();
    this.trailCtx.canvas.width = w;
    this.trailCtx.canvas.height = h;
  };
}
