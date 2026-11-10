import * as THREE from 'three';

/**
 * Yüz sistemi. Tripo'dan gelen modellerde yüz kemiği ya da morph hedefi yoktur; yüz ifadesi
 * burada iki adımda kurulur:
 *
 *  1) `rigidHead`: otomatik rig'ler yüzü, sakalı ve saçı boyun/omuz kemiklerine yayar; kafa
 *     dönünce ya da kol kalkınca yüz bu yüzden gerilir. Kafa hacmindeki köşeler tek kemiğe
 *     (kafa) yeniden bağlanır; kenarda yumuşak geçiş kalır ki boyun bükülebilsin.
 *
 *  2) Köşe gölgelendiricisine eklenen yüz deformasyonu: çene, göz kapakları, kaşlar ve ağız
 *     köşeleri, karakterin dinlenme uzayında (X sol, Y yukarı, Z ön; kafa kemiği orijin) tarif
 *     edilen bölgeler olarak hareket eder. Kafa katı olduğu için bu bölgeler pozdan bağımsızdır.
 *
 * `FaceRig` bunları sürer: metinden üretilen dudak hareketi (ses kaydı varsa genliğiyle birlikte),
 * ruh hâline göre ifade, acı irkilmesi ve göz kırpma.
 */

/** Yüz ölçüleri: metre (2.25 birim boya göre), kafa kemiğinin dinlenme konumuna göre. */
export interface FaceLayout {
  eyeX: number;
  eyeY: number;
  browY: number;
  mouthY: number;
  /** Yüz yüzeyinin öne uzaklığı. */
  front: number;
  /** Özellik boyutu (bir göz genişliği kadar). */
  size: number;
}

export type Mood = 'smug' | 'angry' | 'fear' | 'dead';

interface Expression {
  jaw: number;
  /** 0 açık, 1 kapalı göz kapağı. */
  eyeL: number; eyeR: number;
  /** + kalkık, − inik kaş. */
  browL: number; browR: number;
  /** Kaşların ortada çatılması. */
  furrow: number;
  /** + sırıtış, − sarkmış ağız köşeleri. */
  smile: number;
}

const MOODS: Record<Mood, Expression> = {
  // Tek kaşı kalkık, gözleri hafif kısık, sırıtan.
  smug: { jaw: 0, eyeL: 0.1, eyeR: 0.3, browL: 1, browR: -0.3, furrow: 0, smile: 1 },
  angry: { jaw: 0.04, eyeL: 0.3, eyeR: 0.3, browL: -0.8, browR: -0.8, furrow: 1, smile: -0.6 },
  // Kaşlar kalkık, ağız aralık. (Gözleri "iri açmak" yontulmuş yüzü bozduğu için yok.)
  fear: { jaw: 0.3, eyeL: 0, eyeR: 0, browL: 1, browR: 1, furrow: -0.6, smile: -1 },
  dead: { jaw: 0.55, eyeL: 0.8, eyeR: 0.65, browL: 0, browR: 0, furrow: 0, smile: -0.3 },
};
const PAIN: Expression = { jaw: 0.8, eyeL: 1, eyeR: 1, browL: -0.7, browR: -0.7, furrow: 1, smile: -0.6 };
const KEYS = ['jaw', 'eyeL', 'eyeR', 'browL', 'browR', 'furrow', 'smile'] as const;

/** Ağız açıklığı: Türkçe ünlülere ve dudak ünsüzlerine göre. */
const OPEN: Record<string, number> = {
  a: 1, e: 0.75, o: 0.8, ö: 0.7, ı: 0.45, i: 0.4, u: 0.5, ü: 0.45,
  m: 0, b: 0, p: 0, f: 0.1, v: 0.1,
};

export interface FaceUniforms {
  uFaceMat: { value: THREE.Matrix4 };
  uFaceInv: { value: THREE.Matrix3 };
  uHeadIndex: { value: number };
  uFaceA: { value: THREE.Vector4 };
  uFaceB: { value: THREE.Vector4 };
  uFaceP: { value: THREE.Vector4 };
  uFaceE: { value: THREE.Vector4 };
}

export class FaceRig {
  readonly uniforms: FaceUniforms;
  /** Yumuşatılmış ağız açıklığı: konuşurken kafa vurgusu için. */
  jaw = 0;
  private mood: Mood = 'smug';
  private cur: Expression = { ...MOODS.smug };
  private pain = 0;
  private blink = 0;
  private nextBlink = 1.5;
  private track: number[] = [];
  private speakT = 0;
  private speakDur = 0;

  constructor(layout: FaceLayout, faceMat: THREE.Matrix4, headIndex: number) {
    const inv = new THREE.Matrix4().copy(faceMat).invert();
    this.uniforms = {
      uFaceMat: { value: faceMat },
      uFaceInv: { value: new THREE.Matrix3().setFromMatrix4(inv) },
      uHeadIndex: { value: headIndex },
      uFaceA: { value: new THREE.Vector4(layout.eyeX, layout.eyeY, layout.front, layout.size) },
      uFaceB: { value: new THREE.Vector4(layout.browY, layout.mouthY, 0, 0) },
      uFaceP: { value: new THREE.Vector4() },
      uFaceE: { value: new THREE.Vector4() },
    };
  }

  setMood(mood: Mood) {
    this.mood = mood;
  }

  /** Darbe / kopuş: gözler sıkıca kapanır, ağız açılır, kaşlar çatılır. */
  wince(amount = 1) {
    this.pain = Math.max(this.pain, amount);
  }

  /** Bir replik için dudak hareketi izi üretir. */
  speak(text: string, seconds: number) {
    const track: number[] = [0.1];
    for (const ch of text.toLocaleLowerCase('tr')) {
      if (ch in OPEN) track.push(OPEN[ch]);
      else if (/[.!?…,;:]/.test(ch)) track.push(0, 0, 0); // duraklama
      else if (ch === ' ') track.push(0.12);
      else track.push(0.22);
    }
    track.push(0.05, 0);
    this.track = track;
    this.speakT = 0;
    this.speakDur = Math.max(0.3, seconds);
  }

  silence() {
    this.speakDur = 0;
  }

  /** @param voice çalan ses kaydının anlık genliği (0..1); kayıt yoksa 0. */
  update(dt: number, voice = 0) {
    // Konuşma: metin izinden ağız açıklığı; kayıt çalıyorsa gerçek sesin genliği baskın gelir.
    let talk = 0;
    if (this.speakDur > 0) {
      this.speakT += dt;
      if (this.speakT >= this.speakDur) this.speakDur = 0;
      else {
        const f = (this.speakT / this.speakDur) * (this.track.length - 1);
        const i = Math.floor(f), k = f - i;
        const a = this.track[i], b = this.track[Math.min(i + 1, this.track.length - 1)];
        talk = a + (b - a) * (0.5 - 0.5 * Math.cos(k * Math.PI));
      }
    }
    if (voice > 0.02) talk = Math.min(1, talk * 0.35 + voice * 1.6);

    // Göz kırpma: korkuda ve acıda daha sık.
    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blink = 1;
      this.nextBlink = (this.mood === 'fear' ? 0.8 : 2) + Math.random() * 3.2;
    }
    this.blink = Math.max(0, this.blink - dt / 0.16);
    const lid = this.mood === 'dead' ? 0 : Math.sin(Math.min(1, this.blink) * Math.PI);

    this.pain = Math.max(0, this.pain - dt / 0.55);
    const p = Math.min(1, this.pain);
    const target = MOODS[this.mood];
    const k = 1 - Math.exp(-(this.mood === 'dead' ? 3 : 9) * dt);
    for (const key of KEYS) {
      const want = target[key] + (PAIN[key] - target[key]) * p;
      this.cur[key] += (want - this.cur[key]) * k;
    }

    const jaw = Math.min(1, this.cur.jaw + talk * 0.85);
    this.jaw += (jaw - this.jaw) * Math.min(1, dt * 30);
    const u = this.uniforms;
    u.uFaceP.value.set(this.jaw, this.cur.smile, this.cur.furrow, 0);
    u.uFaceE.value.set(
      Math.max(this.cur.eyeL, lid), Math.max(this.cur.eyeR, lid),
      this.cur.browL, this.cur.browR,
    );
  }
}

/**
 * Kafa hacmindeki köşeleri tek kemiğe (kafa) bağlar. Hacim, modelin tepesinden ölçülen bir
 * elipsoittir: kafa kemiği rig'e göre boyunda da göz hizasında da olsa aynı bölgeyi kapsar.
 *
 * @param world köşelerin dinlenme pozundaki konumları (karakter uzayı)
 * @returns yeniden bağlanan köşe sayısı
 */
export function rigidHead(
  mesh: THREE.SkinnedMesh, world: Float32Array, headIndex: number,
  center: THREE.Vector3, radii: THREE.Vector3,
): number {
  const si = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight;
  let changed = 0;
  for (let i = 0; i < si.count; i++) {
    const dx = (world[i * 3] - center.x) / radii.x;
    const dy = (world[i * 3 + 1] - center.y) / radii.y;
    const dz = (world[i * 3 + 2] - center.z) / radii.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // İçeride tam katı, yüzeyin %30 dışına kadar yumuşak geçiş (boyun burada bükülür).
    const f = 1 - THREE.MathUtils.smoothstep(d, 1, 1.3);
    if (f <= 0) continue;

    const idx = [0, 1, 2, 3].map((k) => si.getComponent(i, k));
    const w = [0, 1, 2, 3].map((k) => sw.getComponent(i, k) * (1 - f));
    let slot = idx.findIndex((j, k) => j === headIndex && sw.getComponent(i, k) > 0);
    if (slot < 0) {
      slot = w.indexOf(Math.min(...w)); // en zayıf etkiyi kafa kemiğiyle değiştir
      w[slot] = 0;
      idx[slot] = headIndex;
    }
    w[slot] += f;
    const sum = w[0] + w[1] + w[2] + w[3] || 1;
    for (let k = 0; k < 4; k++) {
      si.setComponent(i, k, idx[k]);
      sw.setComponent(i, k, w[k] / sum);
    }
    changed++;
  }
  si.needsUpdate = true;
  sw.needsUpdate = true;
  return changed;
}

/** Malzemenin köşe gölgelendiricisine yüz deformasyonunu ekler (iskelet derilemesinden önce). */
export function installFace(material: THREE.Material, uniforms: FaceUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${FACE_PARS}`)
      .replace('#include <skinning_vertex>', `${FACE_MAIN}\n#include <skinning_vertex>`);
  };
  material.customProgramCacheKey = () => 'face';
  material.needsUpdate = true;
}

/** Gölge haritası da aynı deformasyonu görsün: yoksa açılan çenenin gölgesi eski yerinde kalır. */
export function faceDepthMaterial(uniforms: FaceUniforms): THREE.MeshDepthMaterial {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  installFace(m, uniforms);
  m.customProgramCacheKey = () => 'face-depth';
  return m;
}

const FACE_PARS = /* glsl */ `
uniform mat4 uFaceMat;
uniform mat3 uFaceInv;
uniform float uHeadIndex;
uniform vec4 uFaceA; // eyeX, eyeY, front, size
uniform vec4 uFaceB; // browY, mouthY
uniform vec4 uFaceP; // jaw, smile, furrow
uniform vec4 uFaceE; // lidL, lidR, browL, browR

float faceBump(vec2 d) { return exp(-dot(d, d)); }

vec3 faceDeform(vec3 p) {
  float s = uFaceA.w;
  float ex = uFaceA.x, ey = uFaceA.y, by = uFaceB.x, my = uFaceB.y;
  // Yalnızca yüzün ön yüzeyi: ense ve arkadaki saç oynamaz.
  float front = smoothstep(uFaceA.z - 2.4 * s, uFaceA.z - 1.2 * s, p.z);
  float side = p.x >= 0.0 ? 1.0 : -1.0;      // +X karakterin solu
  float lid = p.x >= 0.0 ? uFaceE.x : uFaceE.y;
  float brow = p.x >= 0.0 ? uFaceE.z : uFaceE.w;
  vec3 q = p;

  // Çene: ağız çizgisinin hemen altı aşağı-geri iner. Bölge kısa tutulur: sakalın ucu ve
  // altındaki göğüs oynamaz.
  float below = smoothstep(my + 0.3 * s, my - 0.5 * s, p.y) * smoothstep(my - 1.8 * s, my - 0.9 * s, p.y);
  float jaw = uFaceP.x * below * front * smoothstep(2.6 * s, 1.2 * s, abs(p.x));
  q.y -= jaw * 0.6 * s;
  q.z -= jaw * 0.14 * s;

  // Bölgeler bilerek dar ve hareketler küçük: yontulmuş bir yüzde geniş bir bölgeyi oynatmak
  // burnu, yanakları ve alnı da sürükleyip yüzü bozar.

  // Üst göz kapağı: yalnızca gözün hemen üstündeki şerit göz çizgisine iner. Alt kapak, burun
  // kemeri ve yanak yerinde kalır.
  vec2 de = (p.xy - vec2(side * ex, ey)) / vec2(0.5 * s, 0.26 * s);
  float we = faceBump(de) * front * smoothstep(-0.1 * s, 0.06 * s, p.y - ey);
  q.y -= max(p.y - ey + 0.02 * s, 0.0) * clamp(lid, 0.0, 1.0) * we;

  // Kaşlar: dar bir şerit, en fazla bir santim kadar kalkar / iner; ortada hafifçe çatılır.
  float wb = faceBump((p.xy - vec2(side * ex, by)) / vec2(0.85 * s, 0.26 * s)) * front;
  q.y += brow * 0.11 * s * wb;
  float wi = faceBump((p.xy - vec2(side * ex * 0.45, by)) / vec2(0.45 * s, 0.26 * s)) * front;
  q.y -= uFaceP.z * 0.09 * s * wi;

  // Ağız köşeleri: küçük bir kıvrılma (bıyık / sakal altında fazlası yüzü çarpıtır).
  float wc = faceBump((p.xy - vec2(side * ex * 0.75, my + 0.1 * s)) / vec2(0.4 * s, 0.3 * s)) * front;
  q.y += uFaceP.y * 0.08 * s * wc;
  return q;
}
`;

const FACE_MAIN = /* glsl */ `
#ifdef USE_SKINNING
{
  float faceW = 0.0;
  for (int i = 0; i < 4; i++) {
    if (abs(skinIndex[i] - uHeadIndex) < 0.5) faceW += skinWeight[i];
  }
  if (faceW > 0.5) {
    vec3 fp = (uFaceMat * vec4(transformed, 1.0)).xyz;
    transformed += uFaceInv * (faceDeform(fp) - fp) * smoothstep(0.5, 0.95, faceW);
  }
}
#endif
`;
