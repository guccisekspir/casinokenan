# Ses dosyaları

Toplam **196** replik, kaydı olan: **0**.

Bu dosya `npm run voice-list` ile üretilir; elle düzenlemeyin. Replikleri değiştirmek için
`src/lines/<karakter>.json` dosyalarını düzenleyip komutu yeniden çalıştırın.

- Biçim: **mp3**, mono, tek replik = tek dosya, baştaki/sondaki sessizlik kırpılmış.
- Konum: `public/audio/<karakter>/<olay>_<n>.mp3`
- Dosyası olmayan replik oyunda tarayıcının sesli okumasıyla söylenir; yani kayıtlar parça parça eklenebilir.
- Her olayın alternatifleri vardır; oyun hepsini söylemeden hiçbirini tekrar etmez.

## Asansörcü — 98 replik

Klasör: `public/audio/asansorcu/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Asansöre hoş geldin. İlk kat ikramım: iki x. Aşağısı daha sıcak. | — |
| `intro_2.mp3` | Kapılar kapanıyor. Bu katta sana düşen: iki x. | — |
| `intro_3.mp3` | Yine mi sen? Bin bakalım. Giriş katı, iki x. | — |
| `intro_4.mp3` | Hııh. Yeni yolcu. Al iki x, bahşiş niyetine. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Kaçıncı kat? Fark etmez, hepsi eksi. | — |
| `idle_1_2.mp3` | Bu asansör yalnızca aşağı iner. Bakiyen gibi. | — |
| `idle_1_3.mp3` | Bonus katına az kaldı. Hep az kalır. | — |
| `idle_1_4.mp3` | Düğmeye bas, bekle. Basıyorsun, bekliyorsun. Güzel iş. | — |
| `idle_1_5.mp3` | Dün biri en alt kata indi, on beş bin x aldı. Sen değildin. | — |
| `idle_1_6.mp3` | Maskem neden var? Kaybedenlerin kokusundan. | — |
| `idle_1_7.mp3` | Halat sağlam. Şansın değil. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Asansörde kavga yasak! Tabelayı okumadın mı? | — |
| `idle_2_2.mp3` | Ben yalnızca düğmeye basarım! Katları ben yazmadım! | — |
| `idle_2_3.mp3` | Vurarak yukarı çıkılmaz! | — |
| `idle_2_4.mp3` | Seni kat görevlisine şikâyet edeceğim. | — |
| `idle_2_5.mp3` | Sakin ol, yoksa iki kat arasında bırakırım. | — |
| `idle_2_6.mp3` | Önlüğüm zaten kirliydi, daha da kirlettin! | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur! En alt kata iniyoruz, söz! | — |
| `idle_3_2.mp3` | Ben de mahkûmum burada... yalnızca kapıyı açıyorum. | — |
| `idle_3_3.mp3` | Yukarı çıkmak isterdim. Bir kere olsun. | — |
| `idle_3_4.mp3` | Patron duyarsa beni kazana atar. | — |
| `idle_3_5.mp3` | Tamam, tamam! Hangi katı istersen! | — |
| `idle_3_6.mp3` | Boynuzlarım kiralık, vurma, depozitosu yanar. | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Maskem! Filtresi pahalı! | — |
| `hit_head_2.mp3` | Boynuzuma değil! | — |
| `hit_head_3.mp3` | Hııh! Camım çatladı! | — |
| `hit_head_4.mp3` | Kafama vurma, kat numaraları orada! | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Önlük kalın. Daha sert vur. | — |
| `hit_body_2.mp3` | Gıdıkladın. | — |
| `hit_body_3.mp3` | Kazan dairesinde daha sertini yedim. | — |
| `hit_body_4.mp3` | O yumrukla asansör kapısı bile açılmaz. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | O kol düğmeye basıyor! | — |
| `hit_arm_2.mp3` | Bilekliğim! Çivileri tek tek çaktım! | — |
| `hit_arm_3.mp3` | Kolumu bırak, halatı o çekiyor! | — |
| `hit_arm_4.mp3` | Yavaş! Vardiyam bitmedi. | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Botlarım çelik burunlu. Senin elin değil. | — |
| `hit_leg_2.mp3` | Dizim! Bütün gün ayaktayım zaten! | — |
| `hit_leg_3.mp3` | Bacağıma vurma, asansör sallanır! | — |
| `hit_leg_4.mp3` | Topallarsam kim kat arası koşacak? | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın. Boş kat. | — |
| `miss_2.mp3` | Kapı kapandı, sen dışarıda kaldın. | — |
| `miss_3.mp3` | Havaya vurdun. Hava ödemez. | — |
| `miss_4.mp3` | Yaklaştın. Bonus da hep yaklaşır. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Muşta mı? Bende bilekliğin âlâsı var. | — |
| `weapon_knuckles_2.mp3` | Demir taktın diye kat atlamazsın. | — |
| `weapon_knuckles_3.mp3` | Onu hangi kattan aldın? | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O kılıçla halatı kesme! İkimiz de düşeriz! | — |
| `weapon_katana_2.mp3` | Kasap benim, bıçak sende. Ters bir iş var. | — |
| `weapon_katana_3.mp3` | Bırak onu. Önlüğüm yeterince lekeli. | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | Asansörde ateş edilmez! Seker! | — |
| `weapon_gun_2.mp3` | İndir onu! Ölü asansörcü düğmeye basamaz! | — |
| `weapon_gun_3.mp3` | Tabanca mı? Burası cehennem, kovboy filmi değil. | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | O ışık ne? Burada tek ışık kazanın ateşi! | — |
| `weapon_saber_2.mp3` | Onu söndür, patron görürse el koyar. | — |
| `weapon_saber_3.mp3` | Tamam, sakin. O şey önlüğü de keser mi? | — |

### weapon_saw

Oyuncu testereyi çalıştırdı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saw_1.mp3` | Testere mi? O benim alet çantamdan çıkmış! | — |
| `weapon_saw_2.mp3` | Kapat şunu, asansör boşluğunda yankı yapıyor! | — |
| `weapon_saw_3.mp3` | Hııh. Kasaba testereyle gelinmez. | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Düğmeye neyle basacağım? | — |
| `sever_arm_2.mp3` | O kol demirbaştı! Zimmetliydi! | — |
| `sever_arm_3.mp3` | Tek kolla da halat çekilir... sanırım. | — |
| `sever_arm_4.mp3` | Bunu iş kazası diye yazacağım! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Botu yeniydi! | — |
| `sever_leg_2.mp3` | Asansörcü ayakta durur! Durur muydu... | — |
| `sever_leg_3.mp3` | Bu kat planında yoktu! | — |
| `sever_leg_4.mp3` | Topal şeytan mı olacağım şimdi? | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Bir kat indik. Al biraz x, sus. | — |
| `offer_small_2.mp3` | Bak yükseldi. Asansör iniyor, çarpan çıkıyor. | — |
| `offer_small_3.mp3` | Bu kadarı sana çok bile. | — |
| `offer_small_4.mp3` | Çarpan arttı. Kapıya yaslanma. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Tamam, birkaç kat daha. Ama bu son. | — |
| `offer_mid_2.mp3` | Bu katı kimseye açmadım. Sana açıyorum. | — |
| `offer_mid_3.mp3` | Kazan dairesini mi soyacaksın? | — |
| `offer_mid_4.mp3` | Güzel para bu. Al, in. | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Al! Bütün katlar senin! Yeter ki dur! | — |
| `offer_big_2.mp3` | Bu kadar derine ben bile inmedim! | — |
| `offer_big_3.mp3` | Patron beni kazana atacak... | — |
| `offer_big_4.mp3` | Daha ne istiyorsun? En alt kat mı? Sorma dedim! | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun. Asansör yukarı çıkıyor, çarpan düşüyor. | — |
| `recover_2.mp3` | Bıraktın ya, katlar geri gidiyor. | — |
| `recover_3.mp3` | Geçti bile. Burada herkes çabuk iyileşir, maalesef. | — |
| `recover_4.mp3` | Durursan çıkar. Asansör böyle çalışır. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem kapı açılmaz! | — |
| `near_death_2.mp3` | Ölü asansörcü kat seçemez! | — |
| `near_death_3.mp3` | Yavaş! Anahtar bende, ölürsem kilitli kalırsın! | — |
| `near_death_4.mp3` | Bir vuruş daha ve ikimiz de arada kalırız. | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkamdan mı? Asansörde arkaya dönülmez! | — |
| `aloof_hit_2.mp3` | Seni görmezden geliyordum. Artık gelmiyorum. | — |
| `aloof_hit_3.mp3` | Hop! Kat göstergesine bakıyordum! | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | İndin mi? Korkak. En alt kat bir düğme ötendeydi. | — |
| `cashout_2.mp3` | Akıllısın. Yine de asansör benim. | — |
| `cashout_3.mp3` | Güle güle. Yarın yine bineceksin. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Tamam! En alt kat! Al sana max win! | — |
| `maxwin_2.mp3` | Pes! Bütün bina senin! | — |
| `maxwin_3.mp3` | Al, in, bir daha binme! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Asansör... hep... iner... | — |
| `death_2.mp3` | Ölü... asansörcü... ödemez... | — |
| `death_3.mp3` | Kapılar... kapanıyor... | — |

## Şimşek Dede — 98 replik

Klasör: `public/audio/simsek-dede/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Çok güzel x'ler atıyorum evlat. Süper bir dedeyim. Bak: iki x! | — |
| `intro_2.mp3` | Hoş geldin evlat! Bugün cömert günümdeyim. Al sana iki x. | — |
| `intro_3.mp3` | Yine mi sen? Gel gel. Dedenden iki x kaptın bile, sevin. | — |
| `intro_4.mp3` | Bulutların kapısı açıldı! Ve içinden... iki x çıktı. Alkış. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Bir spin daha at, bu sefer kesin gelecek. | — |
| `idle_1_2.mp3` | Dün birine beş bin x verdim. Sen değildin. | — |
| `idle_1_3.mp3` | Bonusa bir scatter kalmıştı. Bir tane! | — |
| `idle_1_4.mp3` | Bakiyen mi bitti? Yükle gel, ben buradayım. | — |
| `idle_1_5.mp3` | Kaybettiğini çıkarmadan kalkılır mı hiç evlat? | — |
| `idle_1_6.mp3` | Ben yüz x veririm. Başkasına. | — |
| `idle_1_7.mp3` | İki x az mı geldi? Şükretmeyi bilmiyorsun. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Sen kimsin de tanrıya el kaldırıyorsun? | — |
| `idle_2_2.mp3` | Ben adilim! Sertifikam var benim! | — |
| `idle_2_3.mp3` | Kaybetmeyi bilmeyen oynamasın! | — |
| `idle_2_4.mp3` | Vurarak RTP yükselmez evlat. | — |
| `idle_2_5.mp3` | Seni destek hattına şikâyet edeceğim. | — |
| `idle_2_6.mp3` | Verdim ya işte! Daha ne istiyorsun? | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur dur! Bir sonraki spin kesin veriyorum! | — |
| `idle_3_2.mp3` | Ben yalnızca bir sayı üretecisiyim... | — |
| `idle_3_3.mp3` | Makaralar durunca ben kimim ki? | — |
| `idle_3_4.mp3` | Evladım, dedene bunu yapma. | — |
| `idle_3_5.mp3` | Biraz daha sabret. Veriyorum, veriyorum! | — |
| `idle_3_6.mp3` | Az kaldı diyorum, az kaldı! Hep az kalır zaten. | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Ah! Tacım! | — |
| `hit_head_2.mp3` | Kafama değil! Çarpanlar orada duruyor! | — |
| `hit_head_3.mp3` | Sakalıma dokunma! | — |
| `hit_head_4.mp3` | Of! Gözümde şimşek çaktı! | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Vur vur, çarpan yine düşük. | — |
| `hit_body_2.mp3` | Gıdıklandım evlat. | — |
| `hit_body_3.mp3` | Elin de bakiyen kadar hafif. | — |
| `hit_body_4.mp3` | Bana vuracağına bir spin atsaydın. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | Ay! O kolla çarpan atıyorum ben! | — |
| `hit_arm_2.mp3` | Kolumu bırak, makarayı o çeviriyor! | — |
| `hit_arm_3.mp3` | O el şimşek tutar, nazik ol! | — |
| `hit_arm_4.mp3` | Bileğim! Spin tuşuna nasıl basacağım? | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Dizim! Üç bin yıllık dizim! | — |
| `hit_leg_2.mp3` | Yavaş! Romatizmam var. | — |
| `hit_leg_3.mp3` | Sandaletime basma! | — |
| `hit_leg_4.mp3` | Bacağıma vurma, bulut merdiveni çıkıyorum ben! | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın! Tıpkı bonus gibi. | — |
| `miss_2.mp3` | Yaklaştın. Scatter da hep yaklaşır. | — |
| `miss_3.mp3` | Havaya vurdun evlat. Hava ödemez. | — |
| `miss_4.mp3` | Bu da boş spin oldu. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Muşta mı? Ayıp, yaşlı adama. | — |
| `weapon_knuckles_2.mp3` | Onu bakiyenle mi aldın? Demek hâlâ paran var. | — |
| `weapon_knuckles_3.mp3` | Demir takınca şansın açılmaz evlat. | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O ne öyle? Dur, bir konuşalım. | — |
| `weapon_katana_2.mp3` | Kılıçla çarpan kesilmez! Kesilirse ben kesilirim! | — |
| `weapon_katana_3.mp3` | Evlat, o keskin. Bırak onu yere. | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | Tabanca mı? Burası kumarhane, kovboy filmi değil! | — |
| `weapon_gun_2.mp3` | İndir onu! Ölü dede ödeme yapmaz! | — |
| `weapon_gun_3.mp3` | Ateş edersen x'ler de ölür, bilesin. | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | O ışık ne? Şimşek benim işim! | — |
| `weapon_saber_2.mp3` | Bunu hangi slottan çıkardın sen? | — |
| `weapon_saber_3.mp3` | Tamam, tamam, sakin. Bırak o parlak şeyi. | — |

### weapon_saw

Oyuncu testereyi çalıştırdı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saw_1.mp3` | O gürültü ne? Gök gürültüsü benim işim! | — |
| `weapon_saw_2.mp3` | Testere mi? Evlat, ben odun değilim! | — |
| `weapon_saw_3.mp3` | Kapat şunu, sakalıma talaş kaçacak! | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Onunla çarpan atıyordum! | — |
| `sever_arm_2.mp3` | O uzuv bonus dışıydı! | — |
| `sever_arm_3.mp3` | Tek kolla da spin çevrilir... sanırım. | — |
| `sever_arm_4.mp3` | Bunu kurallar sayfasında okumadım! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Bulutlara nasıl çıkacağım? | — |
| `sever_leg_2.mp3` | O bacak sigortalı değildi! | — |
| `sever_leg_3.mp3` | Topal dede mi olacağım şimdi? | — |
| `sever_leg_4.mp3` | Bu... bu oyunun kurallarında yok! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Al sana biraz x. Sevin, kudur. | — |
| `offer_small_2.mp3` | Bak yükseldi. Söylemiştim, cömertim. | — |
| `offer_small_3.mp3` | Bu kadarı sana çok bile. | — |
| `offer_small_4.mp3` | Çarpan arttı. Hadi yine iyisin. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Tamam, biraz daha vereyim. Ama bu son. | — |
| `offer_mid_2.mp3` | Bak güzel para bu. Al, git. | — |
| `offer_mid_3.mp3` | Kasayı mı soyacaksın evlat? | — |
| `offer_mid_4.mp3` | Bu çarpanı kimseye vermedim. Sana veriyorum. | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Al! Al hepsini! Yeter ki dur! | — |
| `offer_big_2.mp3` | Bu kadar x'i ben bile görmedim! | — |
| `offer_big_3.mp3` | Patron beni kovacak... | — |
| `offer_big_4.mp3` | Daha ne istiyorsun? Max win mi? Sorma dedim! | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Yoruldun mu? Çarpan da yoruldu, düşüyor. | — |
| `recover_2.mp3` | Bıraktın ya, x'ler geri gidiyor. | — |
| `recover_3.mp3` | Geçti bile. Dedeler çabuk iyileşir. | — |
| `recover_4.mp3` | Durursan düşer. Slot böyle çalışır evlat. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem ödeme yok! | — |
| `near_death_2.mp3` | Evlat, ölü dede x atamaz! | — |
| `near_death_3.mp3` | Yavaş! Kasayı ben açacağım, ölürsem açılmaz! | — |
| `near_death_4.mp3` | Bir vuruş daha ve ikimiz de kaybederiz. | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkamdan mı vuruyorsun? Terbiyesiz! | — |
| `aloof_hit_2.mp3` | Seninle ilgilenmiyordum. Şimdi ilgileniyorum. | — |
| `aloof_hit_3.mp3` | Hop! Makaraya bakıyordum! | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın mı? Korkak. Max win bir adım ötendeydi. | — |
| `cashout_2.mp3` | Akıllısın. Yine de ben kazandım. | — |
| `cashout_3.mp3` | Git bakalım. Yarın yine geleceksin. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Tamam! Tamam! Al sana max win! | — |
| `maxwin_2.mp3` | Pes! Kasa senin! Hepsi senin! | — |
| `maxwin_3.mp3` | Al, git, bir daha gelme! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Ka... sa... hep... kazanır. | — |
| `death_2.mp3` | Ölü... dede... ödemez... | — |
| `death_3.mp3` | Demiştim... evlat... | — |
