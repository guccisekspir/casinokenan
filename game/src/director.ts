import * as THREE from 'three';

/**
 * Görüntü yönetmeni. Kamera oyuncunun gözü değil, bir film kamerası:
 * planlar arasında sert kesme yapar, plan içinde ağır ağır kayar (dolly / vinç / omuz kamerası).
 */
export type Shot =
  | 'wide'    // simetrik genel plan, ağır ileri kaydırma
  | 'low'     // yerden alt açı: karakter heybetli
  | 'close'   // omuz kamerasıyla yüz yakın planı
  | 'dutch'   // eğik kadraj: denge bozuldu
  | 'orbit'   // yavaş çevrinme
  | 'top'     // tepeden bakış: karakter küçülür
  | 'far'     // karanlıkta uzak, yalnız figür
  | 'impact'  // kopan parçayı izleyen yakın plan
  | 'finale'; // kapanış: vinçle yükselip uzaklaşma

const _t = new THREE.Vector3();

export class Director {
  shot: Shot = 'wide';
  /** Planın başından beri geçen süre (sn). */
  time = 0;
  private side = 1;
  private body = new THREE.Vector3(0, 1.1, 0);
  private head = new THREE.Vector3(0, 1.9, 0);
  private focus: THREE.Object3D | null = null;
  private focusPos = new THREE.Vector3();
  private from = new THREE.Vector3();
  private snap = true;
  private clock = Math.random() * 100;

  constructor(private camera: THREE.PerspectiveCamera) {}

  /** Yeni plana sert kesme. `focus`: 'impact' planında izlenecek nesne / nokta. */
  cut(shot: Shot, focus?: THREE.Object3D | THREE.Vector3) {
    this.shot = shot;
    this.time = 0;
    this.side = Math.random() < 0.5 ? -1 : 1;
    this.snap = true;
    this.from.copy(this.camera.position);
    if (focus instanceof THREE.Vector3) {
      this.focus = null;
      this.focusPos.copy(focus);
    } else if (focus) {
      this.focus = focus;
      this.focusPos.copy(focus.position);
    }
  }

  /** @param body karakterin yerdeki konumu, @param head kafa konumu */
  update(dt: number, body: THREE.Vector3, head: THREE.Vector3) {
    this.time += dt;
    this.clock += dt;
    const t = this.time, s = this.side, cam = this.camera;

    // Özne takibi yumuşak; kesmede anında.
    const k = this.snap ? 1 : 1 - Math.exp(-3.5 * dt);
    // Kadraj merkezi bedenin gerçek yüksekliğini izler: karakter yere inince kamera da iner.
    this.body.lerp(_t.set(body.x, THREE.MathUtils.clamp(body.y * 1.05, 0.25, 1.1), body.z), k);
    this.head.lerp(head, k);
    if (this.focus) this.focusPos.lerp(this.focus.position, this.snap ? 1 : 1 - Math.exp(-10 * dt));
    this.snap = false;

    const b = this.body, h = this.head;
    const by = b.y; // ayakta ~1.1
    const tall = cam.aspect < 0.8 ? 1.45 : 1; // dikey ekranda geri çekil
    const pos = cam.position, look = _t;
    let fov = 38, roll = 0, shake = 0.012;

    switch (this.shot) {
      case 'wide':
        pos.set(b.x * 0.3, 1.2, b.z + (6.1 - 0.7 * ease(t / 12)) * tall);
        look.set(b.x * 0.6, by + 0.15, b.z);
        shake = 0;
        break;
      case 'low':
        pos.set(b.x + s * (1.7 - 0.07 * t), 0.22, b.z + 3.3 * tall);
        look.copy(h).y -= 0.55;
        fov = 44;
        break;
      case 'close':
        pos.set(h.x + s * 0.6, h.y + 0.05, h.z + (2.7 - 0.03 * t) * tall);
        look.copy(h);
        fov = 30;
        shake = 0.03;
        break;
      case 'dutch':
        pos.set(b.x - s * 2.3, 1.7, b.z + 3.7 * tall);
        look.set(b.x, by + 0.25, b.z);
        roll = 0.22 * s;
        fov = 40;
        shake = 0.02;
        break;
      case 'orbit': {
        const a = s * (0.55 + 0.1 * t);
        pos.set(b.x + Math.sin(a) * 4.9 * tall, 1.75, b.z + Math.cos(a) * 4.9 * tall);
        look.set(b.x, by + 0.1, b.z);
        fov = 36;
        break;
      }
      case 'top':
        pos.set(b.x + s * 0.6, 7.4 * tall, b.z + 3.1);
        look.set(b.x, by * 0.9, b.z);
        roll = 0.012 * t * s;
        fov = 34;
        break;
      case 'far':
        pos.set(b.x + s * 1.6, 0.55, b.z + (8.6 - 0.05 * t) * tall);
        look.set(b.x, by + 0.15, b.z);
        fov = 30;
        shake = 0.006;
        break;
      case 'impact': {
        const f = this.focusPos;
        // Kamera, parçanın gövdeden uzak tarafında durur: kopan uzuv önde, karakter arkada kalır.
        const d = _d.copy(this.from).sub(f).setY(0).normalize().multiplyScalar(2.6 * tall);
        const out = _o.copy(f).sub(b).setY(0);
        if (out.lengthSq() > 1e-4) d.addScaledVector(out.normalize(), 1.3);
        pos.copy(f).add(d).setY(Math.max(0.35, f.y + 0.3));
        look.copy(f);
        fov = 36;
        shake = 0.025;
        break;
      }
      case 'finale':
        pos.set(b.x + s * 0.4, 1.0 + 0.55 * t, b.z + (3.6 + 0.65 * t) * tall);
        look.set(b.x, by * 0.45, b.z);
        fov = 36;
        shake = 0.004;
        break;
    }

    // Omuz kamerası: düşük frekanslı salınım.
    const c = this.clock;
    pos.x += (Math.sin(c * 1.3) + Math.sin(c * 2.9) * 0.5) * shake;
    pos.y += (Math.sin(c * 1.7 + 2) + Math.sin(c * 3.7) * 0.5) * shake;
    cam.lookAt(look);
    cam.rotateZ(roll + Math.sin(c * 0.9) * shake * 0.4);
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  }
}
const _d = new THREE.Vector3();
const _o = new THREE.Vector3();
const ease = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
