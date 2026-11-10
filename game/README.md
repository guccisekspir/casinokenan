# Slot Dayağı

Slotta sinirlenenlerin hıncını slot maskotlarından aldığı web oyunu. Maskot sinir bozucu laflar
eder; yeterince dövülünce **MAX WIN** verir. Parodidir: gerçek para / bahis yoktur.

Oyun bir **sanat filmi** gibi kurgulandı: siyah-beyaz görüntüde yalnızca kan, altın ve maskotun
vurgu rengi renkli; sinemaskop çerçeve, altyazı, perde ara yazıları, kesmelerle değişen kamera
planları, kopuşlarda ağır çekim. Maskotun oyunculuğu üç perdede değişir:
**I. Kibir** (alay eder, sırtını döner, volta atar) → **II. Öfke** (azarlar, korunur, sersemler) →
**III. Yakarış** (diz çöker, büzülür, geri geri kaçar).

Three.js + TypeScript + Vite. Ses dosyası yok (WebAudio ile sentez), konuşma tarayıcı TTS'i ile.

```bash
cd game
npm install
npm run dev      # geliştirme: http://localhost:5173
npm run build    # dist/ -> herhangi bir statik hosting'e atılabilir
```

`?unlock` parametresi tüm silahları açar (test için): `http://localhost:5173/?unlock`

## Tripo modelini ekleme

Her maskot için geçici (kodla üretilen) bir karakter var. Gerçek modeli eklemek için:

1. Tripo'da karakteri üret, **rigle** (iskeletli olmalı) ve **GLB** olarak indir.
   Varsa bir "idle" animasyonu ile dışa aktar; yoksa oyun kendi nefes alma hareketini kullanır.
2. Dosyayı `public/models/<karakter-id>.glb` olarak koy
   (`simsek-dede.glb`, `seker-prenses.glb`, `firavun-bey.glb`). Başka bir şey gerekmez;
   dosya varsa otomatik yüklenir, üst bardaki "geçici model" yazısı kaybolur.
3. Gerekirse `src/characters.ts` içindeki `model` alanıyla ayarla:
   - `height`, `rotationY`: boy ve yön
   - `idleClip` / `useClips: false`: hangi animasyon
   - `boneMap`: otomatik kemik eşleme tutmazsa parça → kemik adı. Tutmayan parçalar ve
     modeldeki tüm kemik adları tarayıcı konsoluna yazılır.

Vuruş tepkileri ve uzuv koparma **prosedüreldir**, modele özel hazırlık (parçalara ayrılmış mesh,
vuruş animasyonu vb.) gerekmez. Tek şart: rig'de kafa, üst kol, ön kol, uyluk ve baldır kemikleri
olması (Mixamo / Unreal / Blender tarzı adlandırmalar otomatik tanınır).

## Nasıl çalışıyor

| Dosya | İş |
| --- | --- |
| `src/characters.ts` | Maskot listesi: replikler, can, max win, tema, model ayarı |
| `src/weapons.ts` | Silah tanımları + birinci şahıs silah modelleri |
| `src/character/rig.ts` | Kemik adlarından vücut parçalarını bulur |
| `src/character/character.ts` | Model yükleme, isabet → parça, yaylı vuruş tepkisi, **uzuv koparma** |
| `src/character/acting.ts` | Oyunculuk: davranışlar (pozlar uzuv *yönü* olarak tarif edilir, her rig'de aynı görünür) |
| `src/character/placeholder.ts` | Geçici karakter (gerçek iskelet + SkinnedMesh üretir) |
| `src/game.ts` | Sahne, girdi, saldırı akışı, perdeler, ağır çekim |
| `src/director.ts` | Kamera planları (genel, alt açı, yakın, eğik, tepe, uzak, kopuş, final) ve kesmeler |
| `src/film.ts` | Renk banyosu: seçici renk, gren, vinyet |
| `src/fx.ts` | Kan/kıvılcım parçacıkları, kopan parçaların fiziği, arkadaki slot makarası |

**Uzuv koparma** (`Character.sever`): kopan kemiğin alt ağacına ağırlıklı üçgenler o anki pozda
"pişirilip" bağımsız bir parçaya dönüşür, kemik sıfıra ölçeklenerek gövdedeki uzuv yok edilir,
kesik yerine kapak konur. Herhangi bir rig'li mesh ile çalışır.

**Yeni silah**: `WEAPONS` listesine satır ekle. Davranış `kind` ile gelir —
`blunt` (tıkla-vur), `slash` (sürükle-kes), `shot` (tıkla-ateş). `sever > 0` ise uzuv koparır,
`cauterize` kan yerine dağlama yapar. Görseli `buildViewModel` içine eklenir.

**Yeni maskot**: `CHARACTERS` listesine kayıt ekle (+ isteğe bağlı GLB).

**Yeni davranış**: `acting.ts` içindeki `BEHAVIORS`'a bir fonksiyon ekle, `game.ts`'teki `ACTS`
listesinde ilgili perdeye adını yaz. **Yeni kamera planı**: `director.ts` içindeki `switch`'e ekle.
