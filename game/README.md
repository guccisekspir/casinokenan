# Slot Dayağı

Slotta sinirlenenlerin hıncını slot maskotlarından aldığı web oyunu. Maskot sinir bozucu laflar
eder; yeterince dövülünce **MAX WIN** verir. Parodidir: gerçek para / bahis yoktur.

**Kural: maskotu öldürmeden max win'i kopar.** Her vuruş onu sıkıştırır ve verdiği çarpan basamak
basamak yükselir (2x → 5x → … → 2.500x → max win). Ama her vuruş canını da götürür: kafa çok,
gövde orta, uzuvlar az. Canı biterse ölür ve ölü maskot ödeme yapmaz — kasa kazanır. Durursan
toparlanır, çarpan geri düşer. Aynı yere üst üste vurmak gittikçe daha az işe yarar. İstediğin an
o anki çarpanı alıp çıkabilirsin. Ayarlar `src/game.ts` başındaki sabitlerde.

**Yürüme:** WASD / ok tuşları (dokunmatik ekranda sol alttaki çubuk). Oyuncu sahnede dolaşır,
bakışı maskota kilitlidir; yumruk ve kılıç ancak yakından isabet eder. Bir süre durursan kamera
yeniden yönetmene geçer, ilk tuşta sana döner.

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

Deneme sürümünde bütün silahlar açık gelir (`src/main.ts`).

## Tripo modelini ekleme

Her maskot için geçici (kodla üretilen) bir karakter var. Gerçek modeli eklemek için:

1. Tripo'da karakteri üret, **rigle** (iskeletli olmalı) ve **GLB** olarak indir.
   Varsa bir "idle" animasyonu ile dışa aktar; yoksa oyun kendi nefes alma hareketini kullanır.
2. Dosyayı `public/models/<karakter-id>.glb` olarak koy
   (ör. `simsek-dede.glb`, `asansorcu.glb`). Başka bir şey gerekmez;
   dosya varsa otomatik yüklenir, üst bardaki "geçici model" yazısı kaybolur.
3. Gerekirse `src/characters.ts` içindeki `model` alanıyla ayarla:
   - `height`, `rotationY`: boy ve yön (yön verilmezse iskeletten otomatik bulunur)
   - `idleClip` / `useClips: false`: hangi animasyon
   - `face`: yüz ölçüleri (göz, kaş, ağız konumu). Verilmezse tahmin edilir; ifade yanlış yere
     oturuyorsa buradan ayarlanır
   - `mask`: yüz maske / kask ise mimik uygulanmaz; `head`: boynuz, şapka gibi çıkıntıları da
     kapsayan katı kafa hacmi
   - `boneMap`: otomatik kemik eşleme tutmazsa parça → kemik adı. Tutmayan parçalar ve
     modeldeki tüm kemik adları tarayıcı konsoluna yazılır.

Vuruş tepkileri ve uzuv koparma **prosedüreldir**, modele özel hazırlık (parçalara ayrılmış mesh,
vuruş animasyonu vb.) gerekmez. Tek şart: rig'de kafa, üst kol, ön kol, uyluk ve baldır kemikleri
olması (Mixamo / Unreal / Blender tarzı adlandırmalar otomatik tanınır).

## Nasıl çalışıyor

| Dosya | İş |
| --- | --- |
| `src/characters.ts` | Maskot listesi: replikler, can, max win, tema, model ayarı |
| `src/weapons.ts` | Silah tanımları |
| `src/viewmodel.ts` | Oyuncunun elleri ve elindeki silah (birinci şahıs) |
| `src/character/rig.ts` | Kemik adlarından vücut parçalarını bulur |
| `src/character/character.ts` | Model yükleme, isabet → parça, yaylı vuruş tepkisi, **uzuv koparma** |
| `src/character/acting.ts` | Oyunculuk: davranışlar (pozlar uzuv *yönü* olarak tarif edilir, her rig'de aynı görünür) |
| `src/character/face.ts` | Yüz: kafayı tek kemiğe bağlama (gerilme olmasın), gölgelendiricide çene / göz / kaş / ağız, dudak hareketi |
| `src/character/ragdoll.ts` | Konum tabanlı fizik: kopan uzuvlar ve ölü beden eklemlerinden bükülür, yere serilir |
| `src/character/placeholder.ts` | Geçici karakter (gerçek iskelet + SkinnedMesh üretir) |
| `src/game.ts` | Sahne, girdi, saldırı akışı, perdeler, ağır çekim |
| `src/dialogue.ts` | Konuşma yönetmeni: olay → replik, öncelik, tekrar etmeme, ses dosyası / sesli okuma yedeği |
| `src/lines/<id>.json` | Karakterin replikleri: olay başına alternatifler |
| `src/director.ts` | Kamera planları (genel, alt açı, yakın, eğik, tepe, uzak, kopuş, final) ve kesmeler |
| `src/film.ts` | Renk banyosu: seçici renk, gren, vinyet |
| `src/fx.ts` | Kan/kıvılcım parçacıkları, kopan parçaların fiziği, arkadaki slot makarası |

**Uzuv koparma** (`Character.sever`): kopan kemiğin alt ağacına ağırlıklı üçgenler o anki pozda
"pişirilip" bağımsız bir parçaya dönüşür, kemik sıfıra ölçeklenerek gövdedeki uzuv yok edilir,
kesik yerine kapak konur. Herhangi bir rig'li mesh ile çalışır.

**Yaralı beden** (`Character.compose`, `onSever`): oyunculuk pozunun üstüne bedenin gerçek durumu
biner. Tek bacak kalınca kollarını açıp seker, sonra yere iner; iki tarafta da uyluk varsa diz üstü,
yoksa oturur ve sağlam kolunu yere dayar (kol ters kinematiği). Uzuv kopunca irkilir, yarasına bakar,
sağlam eliyle güdüğü tutar, titrer, hızlı nefes alır; canı azaldıkça omuzları düşer. Kan nabızla atar.
Kopan parça kendi iskeletiyle ayrı bir ragdoll'dur; ölüm de aynı fizikle bir yığılmadır.

**Yeni silah**: `WEAPONS` listesine satır ekle. Davranış `kind` ile gelir —
`blunt` (tıkla-vur), `slash` (sürükle-kes), `shot` (tıkla-ateş). `sever > 0` ise uzuv koparır,
`cauterize` kan yerine dağlama yapar. Görseli `src/viewmodel.ts` içine eklenir.

**Yeni maskot**: `CHARACTERS` listesine kayıt ekle (+ isteğe bağlı GLB).

**Yeni davranış**: `acting.ts` içindeki `BEHAVIORS`'a bir fonksiyon ekle, `game.ts`'teki `ACTS`
listesinde ilgili perdeye adını yaz. **Yeni kamera planı**: `director.ts` içindeki `switch`'e ekle.

## Replikler ve ses dosyaları

Karakter olaylara göre konuşur (açılışta övünme, beklerken kışkırtma, nereye vurulduğu, hangi
silahı aldığın, uzuv kopması, çarpanın yükselmesi/düşmesi, ölüme yaklaşma, alıp çıkma, max win,
ölüm). Her olayın birkaç alternatifi vardır; hepsi söylenmeden hiçbiri tekrar etmez.

- Replikleri değiştir / ekle: `src/lines/<karakter>.json` (bir olaya satır eklemek yeterli).
- Kaydedilecek dosyaların listesi: `npm run voice-list` → `VOICE_LINES.md` ve `voice-lines.csv`.
- Kayıtlar `public/audio/<karakter>/<olay>_<n>.mp3` olarak konur. Dosyası olmayan replik
  tarayıcının sesli okumasıyla söylenir; kayıtlar parça parça eklenebilir.
