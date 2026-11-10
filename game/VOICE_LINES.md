# Ses dosyaları

Toplam **528** replik, kaydı olan: **0**.

Bu dosya `npm run voice-list` ile üretilir; elle düzenlemeyin. Replikleri değiştirmek için
`src/lines/<karakter>.json` dosyalarını düzenleyip komutu yeniden çalıştırın.

- Biçim: **mp3**, mono, tek replik = tek dosya, baştaki/sondaki sessizlik kırpılmış.
- Konum: `public/audio/<karakter>/<olay>_<n>.mp3`
- Dosyası olmayan replik oyunda tarayıcının sesli okumasıyla söylenir; yani kayıtlar parça parça eklenebilir.
- Her olayın alternatifleri vardır; oyun hepsini söylemeden hiçbirini tekrar etmez.

## Asansörcü — 104 replik

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

### weapon_slap

Oyuncu Osmanlı tokadını seçti (elini açtı).

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_slap_1.mp3` | O el ne öyle? Asansör kapısı gibi. | — |
| `weapon_slap_2.mp3` | Tokat mı? Maskem yerinden oynar! | — |
| `weapon_slap_3.mp3` | Avucunu indir, kat düğmesi değil o. | — |

### buried

Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `buried_1.mp3` | Bir kat aşağı indim! Asansörsüz! | — |
| `buried_2.mp3` | Hııh... zemin kat burasıymış. | — |
| `buried_3.mp3` | Beni kazan dairesine mi yolladın? | — |

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

## Balıkçı Dede — 108 replik

Klasör: `public/audio/balikci/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Otur evlat, olta hazır. Göl balık dolu bugün. Şimdilik al şu iki x'i, yem parası. | — |
| `intro_2.mp3` | Hoş geldin. Bugün büyük balık günü, hissediyorum. Önce ufak bir iki x. | — |
| `intro_3.mp3` | Yine mi sen? Güzel. Kovayı getirdin mi? İki x'le başlayalım. | — |
| `intro_4.mp3` | Sabırlı ol evlat. Balıkçılık sabır işidir. İki x de sabır ister. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Bak göl balık dolu! Ben mi? Ben şimdi gelemem, işim var. | — |
| `idle_1_2.mp3` | Bir sürü balık çıktı. Toplayacak balıkçı yok. Ne yazık. | — |
| `idle_1_3.mp3` | İkinci aşamaya az kaldı. Bir balıkçı daha gelse... gelmedi. | — |
| `idle_1_4.mp3` | İki x'lik balık çıkınca hemen gelirim, merak etme. | — |
| `idle_1_5.mp3` | Dört balıkçı lazımdı. Üç geldi. Dördüncü ben olacaktım, üşendim. | — |
| `idle_1_6.mp3` | Sabır evlat. Ben kırk yıldır aynı balığı bekliyorum. | — |
| `idle_1_7.mp3` | Yem bitti mi? Yükle gel. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Balıkçıya el kalkmaz! Oltam kırılır! | — |
| `idle_2_2.mp3` | Ben ne yapayım, balık vurmadı! | — |
| `idle_2_3.mp3` | Aşama atlattım ya işte! Daha ne istiyorsun? | — |
| `idle_2_4.mp3` | Seni göl müdürlüğüne şikâyet edeceğim. | — |
| `idle_2_5.mp3` | Vurarak balık tutulmaz evlat. | — |
| `idle_2_6.mp3` | Geldim ya! İki x'lik balığa geldim ama geldim! | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur! Son aşamadayız, bak! Ödeme mi? O ayrı konu. | — |
| `idle_3_2.mp3` | Buraya kadar getirdim seni. Gerisi nasip. | — |
| `idle_3_3.mp3` | Ben de yalnızca yemim aslında... oltayı başkası tutuyor. | — |
| `idle_3_4.mp3` | Tamam, tamam! Kovayı sana vereyim! Boş ama! | — |
| `idle_3_5.mp3` | Son aşama dediysem, ödeyeceğim demedim. | — |
| `idle_3_6.mp3` | Kırk yıl bekledim, şimdi de dayak yiyorum. | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Şapkam! İçinde iğnelerim var! | — |
| `hit_head_2.mp3` | Kafama vurma, balıkların yerini orada tutuyorum! | — |
| `hit_head_3.mp3` | Sakalım! Kırk yılda uzattım! | — |
| `hit_head_4.mp3` | Gözlüğüm! Şamandırayı göremem! | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Yeleğimin cebinde yem var, ezme! | — |
| `hit_body_2.mp3` | Göbeğime vurdun. Balık yedim az önce. | — |
| `hit_body_3.mp3` | Dalga bile daha sert vurur. | — |
| `hit_body_4.mp3` | Vur vur, balıkçı yine gelmez. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | Olta kolum o! | — |
| `hit_arm_2.mp3` | O elle makara çeviriyorum! | — |
| `hit_arm_3.mp3` | Bileğim! Savuramam artık! | — |
| `hit_arm_4.mp3` | Kolumu bırak, misinayı o tutuyor. | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Çizmem! Su alır şimdi! | — |
| `hit_leg_2.mp3` | Dizim! Zaten nemden ağrıyordu! | — |
| `hit_leg_3.mp3` | Bacağıma vurma, tekne sallanıyor! | — |
| `hit_leg_4.mp3` | Topal balıkçı kıyıda kalır. | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın. Balık kaçtı. | — |
| `miss_2.mp3` | Olta boş geldi. | — |
| `miss_3.mp3` | Yaklaştı ama vurmadı. Tanıdık mı? | — |
| `miss_4.mp3` | Suya vurdun evlat. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Muşta mı? Onunla balık mı tutacaksın? | — |
| `weapon_knuckles_2.mp3` | Demir yumruk. Kurşun ağırlık niyetine kullanırdım. | — |
| `weapon_knuckles_3.mp3` | Onu göle atsan dibe gider, senin bakiyen gibi. | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O bıçak fileto için fazla uzun. | — |
| `weapon_katana_2.mp3` | Balık mı temizleyeceğiz? Yoksa beni mi? | — |
| `weapon_katana_3.mp3` | Bırak onu, misinayı kesersin. | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | Tabancayla balık tutulmaz! Denedim. | — |
| `weapon_gun_2.mp3` | İndir onu! Ölü balıkçı hiç gelmez! | — |
| `weapon_gun_3.mp3` | Ateş etme, balıklar ürker! | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | O ışık ne? Gece balığına mı çıkıyoruz? | — |
| `weapon_saber_2.mp3` | Onunla göl kaynar, balık haşlanır. | — |
| `weapon_saber_3.mp3` | Tamam, sakin. O şey oltamı eritir. | — |

### weapon_saw

Oyuncu testereyi çalıştırdı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saw_1.mp3` | Testere mi? Buz balıkçılığı mı yapacağız? | — |
| `weapon_saw_2.mp3` | Kapat şunu, balıklar kaçıyor! | — |
| `weapon_saw_3.mp3` | Onunla tekne yaparlar. Ya da tabut. | — |

### weapon_slap

Oyuncu Osmanlı tokadını seçti (elini açtı).

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_slap_1.mp3` | O el kürek gibi. Uzak tut. | — |
| `weapon_slap_2.mp3` | Tokat mı? Balık gibi çırpınırım! | — |
| `weapon_slap_3.mp3` | Avucunla su mu dövüyorsun evlat? | — |

### buried

Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `buried_1.mp3` | Dibe vurdum! Gölün dibine! | — |
| `buried_2.mp3` | Solucan gibi toprağa girdim! | — |
| `buried_3.mp3` | Çizmeme çamur doldu, çek beni! | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Oltayı kim savuracak? | — |
| `sever_arm_2.mp3` | Tek kolla da gelmem, merak etme. | — |
| `sever_arm_3.mp3` | O kol kırk yıllık makara koluydu! | — |
| `sever_arm_4.mp3` | Bunu balıkçılar derneğine yazacağım! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Çizmesi yeniydi! | — |
| `sever_leg_2.mp3` | Tekneye nasıl bineceğim? | — |
| `sever_leg_3.mp3` | Balıklar bile acıdı halime. | — |
| `sever_leg_4.mp3` | Bu oltada yoktu evlat! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Bak bir balık vurdu. Küçük ama balık. | — |
| `offer_small_2.mp3` | Çarpan arttı. Balıkçı yine yok, kusura bakma. | — |
| `offer_small_3.mp3` | Bu hamsi. Levrek arkada, görürsün. | — |
| `offer_small_4.mp3` | Azıcık yükseldi. Sabır. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Göl doldu taştı! Ben mi? Geliyorum, geliyorum. Gelmedim. | — |
| `offer_mid_2.mp3` | Güzel balıklar bunlar. Toplayan olsa. | — |
| `offer_mid_3.mp3` | Kovayı mı dolduracaksın? Kova delik. | — |
| `offer_mid_4.mp3` | Bu kadarını gösteririm. Toplamak ayrı iş. | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Son aşama! Bak neler var! Dokunmak yok! | — |
| `offer_big_2.mp3` | Bu kadar balığı ben bile görmedim. Ödemesini de görmeyeceksin. | — |
| `offer_big_3.mp3` | Patron beni göle atacak... | — |
| `offer_big_4.mp3` | Daha ne istiyorsun? Ödeme mi? Güldürme evlat! | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun. Balıklar dağıldı bak. | — |
| `recover_2.mp3` | Bıraktın ya, misinayı topluyorum. | — |
| `recover_3.mp3` | Geçti. Balıkçı milleti dayanıklıdır. | — |
| `recover_4.mp3` | Durursan kaçar. Balık da, çarpan da. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem balıkları kim toplayacak? Ben de toplamıyordum gerçi! | — |
| `near_death_2.mp3` | Ölü balıkçı hiç gelmez evlat! | — |
| `near_death_3.mp3` | Yavaş! Teknenin anahtarı bende! | — |
| `near_death_4.mp3` | Bir vuruş daha ve göl sahipsiz kalır. | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkadan mı? Şamandırama bakıyordum! | — |
| `aloof_hit_2.mp3` | Seni duymuyordum. Balık sessizlik ister. | — |
| `aloof_hit_3.mp3` | Hop! Oltam titredi sandım! | — |

### stall

Yalnızca oyalayan maskot: ikinci perdeye geçecek gibi yapar, geçmez.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `stall_1.mp3` | İkinci aşamaya geçiyoruz! ...Şaka şaka. Bir balıkçı eksik. | — |
| `stall_2.mp3` | Hah, geçtik! Dur, geçmedik. Bir tane daha lazımmış. | — |
| `stall_3.mp3` | Tam geçiyordum, misinam dolandı. Baştan. | — |
| `stall_4.mp3` | Az kaldı dedim ya. Hâlâ az kaldı. | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın mı? Kovana bak. Boş, değil mi? Heh. | — |
| `cashout_2.mp3` | Akıllısın. Yine de balıklar bende kaldı. | — |
| `cashout_3.mp3` | Güle güle. Yarın yine yem atarsın. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Tamam! Tamam! Bütün balıkçılar geldi! Topla hepsini! | — |
| `maxwin_2.mp3` | Pes! Göl senin! Tekne de senin! | — |
| `maxwin_3.mp3` | Al, git, bir daha oltama dokunma! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Balık... vurmadı... | — |
| `death_2.mp3` | Ölü... balıkçı... gelmez... | — |
| `death_3.mp3` | Az... kalmıştı... | — |

## Demirci — 108 replik

Klasör: `public/audio/demirci/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Hoş geldin yolcu! Max win'i senin için dövdüm. Bak, ekranda duruyor. Uzan, al. | — |
| `intro_2.mp3` | Gel gel! Max hazır, sıcak sıcak. Aramızda yalnızca ufacık bir parmaklık var. | — |
| `intro_3.mp3` | Bugün şanslı günün. Max'ı vitrine koydum. Bakmak serbest. | — |
| `intro_4.mp3` | Yine mi sen? Max hâlâ burada, seni bekliyor. Ben de bekliyorum. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Max orada duruyor. Neden almıyorsun? Ha, parmaklık. | — |
| `idle_1_2.mp3` | Bir vuruş daha, max senin. Geçen sefer de öyle demiştim. | — |
| `idle_1_3.mp3` | Bak ne güzel parlıyor. Dokunmak yasak. | — |
| `idle_1_4.mp3` | Ben vereceğim diyorum, sen inanmıyorsun. Haklısın. | — |
| `idle_1_5.mp3` | Max'ı ben dövdüm, kilidini de ben dövdüm. İyi iş çıkardım. | — |
| `idle_1_6.mp3` | Yaklaş, yaklaş. Biraz daha. Tamam, yeter, dur orada. | — |
| `idle_1_7.mp3` | Dün biri aldı max'ı. Rüyasında. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Vurdukça vereceğimi mi sandın? Vurdukça kilit takıyorum! | — |
| `idle_2_2.mp3` | Demirciye el kalkmaz! Örsüm var benim! | — |
| `idle_2_3.mp3` | Max senin diyorum! Yalnızca şu kapıyı açamıyorum! | — |
| `idle_2_4.mp3` | Sabırsız yolcu ocakta yanar. | — |
| `idle_2_5.mp3` | Anahtarı kaybettim. Yemin ederim. Sanırım. | — |
| `idle_2_6.mp3` | Ben söz verdim, tarih vermedim! | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur! Bu sefer gerçekten açıyorum! Gerçekten! | — |
| `idle_3_2.mp3` | Kilit kalmadı... neredeyse kalmadı... | — |
| `idle_3_3.mp3` | Zanaatım yalan söylemekti, çekiç bahaneydi. | — |
| `idle_3_4.mp3` | Tamam, tamam! Anahtar sakalımın içinde! | — |
| `idle_3_5.mp3` | Vurma, açıyorum! Elim titriyor, sokamıyorum anahtarı! | — |
| `idle_3_6.mp3` | Bir set daha çekemem... demirim bitti. | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Miğferim! Onu üç gecede dövdüm! | — |
| `hit_head_2.mp3` | Boynuzuma vurma, eğrilir! | — |
| `hit_head_3.mp3` | Kafam örs gibidir, elin acır. | — |
| `hit_head_4.mp3` | Çınladı! Güzel ses, değil mi? | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Zırh bu yolcu, zırh. Daha sert. | — |
| `hit_body_2.mp3` | Kendi dövdüğüm çeliğe mi vuruyorsun? | — |
| `hit_body_3.mp3` | Körük kadar bile etmedi. | — |
| `hit_body_4.mp3` | Pelerinimi buruşturma. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | Çekiç kolum o! | — |
| `hit_arm_2.mp3` | Bilekliğime çentik attın! | — |
| `hit_arm_3.mp3` | O elle kilit takıyorum, bırak! | — |
| `hit_arm_4.mp3` | Yavaş! Demirci kolsuz olmaz. | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Çizmelerim demir burunlu! | — |
| `hit_leg_2.mp3` | Dizim! Zaten kısa boyluyum! | — |
| `hit_leg_3.mp3` | Bacağıma vurma, ocağın başında dikiliyorum! | — |
| `hit_leg_4.mp3` | Devrilirsem max'ın üstüne düşerim, ezilir. | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın. Max'ı da ıskalıyorsun. | — |
| `miss_2.mp3` | Boşa salladın. Parmaklığa bile değmedi. | — |
| `miss_3.mp3` | Havayı dövüyorsun. O benim işim. | — |
| `miss_4.mp3` | Yaklaştın. Yaklaşmak serbest. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Muşta mı? Kötü döküm. Ben olsam geri verirdim. | — |
| `weapon_knuckles_2.mp3` | O demiri kim dövdü? Ayıp. | — |
| `weapon_knuckles_3.mp3` | Demirle demirciye mi geliyorsun? | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | Güzel çelik. Parmaklığı kesmez ama. | — |
| `weapon_katana_2.mp3` | O kılıcı bana bırak, bileyip geri... vermem. | — |
| `weapon_katana_3.mp3` | Suyu iyi verilmiş. Bana doğrultma. | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | O ne? Çekiçsiz dövülmüş bir şey. Güvenmem. | — |
| `weapon_gun_2.mp3` | İndir onu! Ölü demirci kilit açamaz! | — |
| `weapon_gun_3.mp3` | Ateşi ben yakarım burada! | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | Bu ışığı hangi ocak verdi? Kıskandım. | — |
| `weapon_saber_2.mp3` | Onunla parmaklığı kesme sakın. Sakın! | — |
| `weapon_saber_3.mp3` | Tamam, sakin. O şey demir eritir mi? | — |

### weapon_saw

Oyuncu testereyi çalıştırdı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saw_1.mp3` | Testere mi? Demir keser mi o? Kesmesin! | — |
| `weapon_saw_2.mp3` | Kapat şunu, körüğümün sesini bastırıyor! | — |
| `weapon_saw_3.mp3` | O dişleri ben bilerdim, daha iyi olurdu. | — |

### weapon_slap

Oyuncu Osmanlı tokadını seçti (elini açtı).

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_slap_1.mp3` | O el çekiç gibi. Hoşuma gitmedi. | — |
| `weapon_slap_2.mp3` | Tokat mı? Örse vurur gibi vurma! | — |
| `weapon_slap_3.mp3` | Avucun nasırlı. Usta işi. | — |

### buried

Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `buried_1.mp3` | Çivi gibi çaktın beni! | — |
| `buried_2.mp3` | Örsün altına girdim! Çıkar! | — |
| `buried_3.mp3` | Boyum zaten kısaydı, şimdi hiç yok! | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Çekici kim tutacak? | — |
| `sever_arm_2.mp3` | Tek kolla kilit takılır mı? Deneyeceğim. | — |
| `sever_arm_3.mp3` | O kol ustalık belgemdi! | — |
| `sever_arm_4.mp3` | Bunu loncaya bildireceğim! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Daha da kısaldım! | — |
| `sever_leg_2.mp3` | Çizme tekti artık, yazık. | — |
| `sever_leg_3.mp3` | Ocağın başına nasıl dikileceğim? | — |
| `sever_leg_4.mp3` | Bu anlaşmada yoktu yolcu! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Al biraz x. Asıl ödül arkada, görüyorsun. | — |
| `offer_small_2.mp3` | Yükseldi. Max'a bir adım... bir adım daha... bir adım daha. | — |
| `offer_small_3.mp3` | Bu kırıntı. Somun orada, parmaklığın ardında. | — |
| `offer_small_4.mp3` | Çarpan arttı. Max hâlâ yerinde, merak etme. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | İyi gidiyorsun. Max neredeyse senin. Neredeyse. | — |
| `offer_mid_2.mp3` | Bu kadarını veririm. Ötesi için kilit var. | — |
| `offer_mid_3.mp3` | Bak yaklaştın. Yeni bir kilit dövsem mi? | — |
| `offer_mid_4.mp3` | Güzel çarpan. Al, git. Max'a bakma. | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Dur! Parmaklığa dayandın! | — |
| `offer_big_2.mp3` | Bu kadar yaklaşan olmamıştı! | — |
| `offer_big_3.mp3` | Demirim bitiyor, kilit dövemiyorum! | — |
| `offer_big_4.mp3` | Daha ne istiyorsun? Max mı? Orada işte, baksana! | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun. Max yine uzaklaştı, gördün mü? | — |
| `recover_2.mp3` | Bıraktın ya, kilitleri sıkıyorum. | — |
| `recover_3.mp3` | Geçti. Cüceler sağlam dökülür. | — |
| `recover_4.mp3` | Durursan soğur. Demir de, şans da. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem kilit açılmaz! | — |
| `near_death_2.mp3` | Ölü demirci anahtar dövemez! | — |
| `near_death_3.mp3` | Yavaş! Anahtar bende, ölürsem max içeride kalır! | — |
| `near_death_4.mp3` | Bir vuruş daha ve max ebediyen kilitli. | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkamdan mı? Örsün başındaydım! | — |
| `aloof_hit_2.mp3` | Seni görmüyordum. Şimdi görüyorum, beğenmedim. | — |
| `aloof_hit_3.mp3` | Hop! Kilide bakıyordum! | — |

### block

Yalnızca set çeken maskot: oyuncu tam max alacakken önüne yeni bir parmaklık çeker.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `block_1.mp3` | Hop! Bir parmaklık daha. Az kalmıştı, değil mi? | — |
| `block_2.mp3` | Dur bakalım! Tam alıyordun... set çektim. | — |
| `block_3.mp3` | Olmaz! Max orada kalacak. Yeni kilit, taze döküm! | — |
| `block_4.mp3` | Tık! Kapandı. Baştan alalım mı? | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın mı? Korkak. Max bir parmaklık ötendeydi. | — |
| `cashout_2.mp3` | Akıllı yolcu. Max yine bana kaldı. | — |
| `cashout_3.mp3` | Güle güle. Yarın yine vitrine bakarsın. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Tamam! Kilit kalmadı! Al, max senin! | — |
| `maxwin_2.mp3` | Pes! Kapı açık! Ocak da senin olsun! | — |
| `maxwin_3.mp3` | Al, git, bir daha yol üstüme çıkma! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Max... içeride... kaldı... | — |
| `death_2.mp3` | Ölü... demirci... açamaz... | — |
| `death_3.mp3` | Kilit... sağlamdı... | — |

## Haydut — 104 replik

Klasör: `public/audio/haydut/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Hoş geldin evlat. Bu elde beş VS geliyor, söz. Şimdilik al şu iki x'i. | — |
| `intro_2.mp3` | Kasabaya hoş geldin. Beş VS'yi senin için ayırdım. Önce ufak bir iki x. | — |
| `intro_3.mp3` | Yine mi sen? Güzel. Bugün beş VS günü. Şerefim üzerine. Şerefim yok gerçi. | — |
| `intro_4.mp3` | Otur. Beş VS yolda. Atla geliyor, at yavaş. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Beş VS geliyor diyorum. Üç geldi. Hiçbiri yan yana değil. | — |
| `idle_1_2.mp3` | Bak üç VS! Hat tutmadı ama. Ne şanssızlık. | — |
| `idle_1_3.mp3` | Yüz x'e aldın, beş x verdim. Kasabanın vergisi ağır. | — |
| `idle_1_4.mp3` | Bir sonraki elde beş VS. Geçen elde de öyle demiştim. | — |
| `idle_1_5.mp3` | Düşük ödedim, yine düşük ödeyeceğim. İstikrar önemli. | — |
| `idle_1_6.mp3` | VS'ler var, hat yok. Hat var, VS yok. Böyle bir dünya. | — |
| `idle_1_7.mp3` | Düelloyu hep ben kazanırım. Tabancayı ben dolduruyorum. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Ödedim ya! Beş x de paradır! | — |
| `idle_2_2.mp3` | Yumrukla hat mı tutturacaksın? | — |
| `idle_2_3.mp3` | Ben hile yapmam! Yalnızca hiç vermem! | — |
| `idle_2_4.mp3` | Şerife şikâyet et. Şerif benim. | — |
| `idle_2_5.mp3` | Üç VS verdim, nankör! Bağlanmadıysa benim suçum mu? Evet. | — |
| `idle_2_6.mp3` | Kasabadan kovarım seni! | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur! Bu sefer beşi de geliyor! Yemin ederim! | — |
| `idle_3_2.mp3` | Tamam, dördüncü VS'yi vereyim. Beşinciyi konuşuruz. | — |
| `idle_3_3.mp3` | Ben de küçük bir haydudum aslında... büyük kasa başkasının. | — |
| `idle_3_4.mp3` | Vurma! Hat çizerim, elimle çizerim! | — |
| `idle_3_5.mp3` | Bütün eksik ödediklerimi geri veririm! Taksitle! | — |
| `idle_3_6.mp3` | Düello istemiyorum artık. Barışalım mı? | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Şapkam! Ona dokunulmaz! | — |
| `hit_head_2.mp3` | Kafama değil, kurşun izim var orada! | — |
| `hit_head_3.mp3` | Bıyığımı bozdun! | — |
| `hit_head_4.mp3` | Gözüm karardı. VS mi gördüm? | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Yeleğime vurdun. Altında saat var, kırma. | — |
| `hit_body_2.mp3` | Bu da beş x'lik bir yumruk oldu. | — |
| `hit_body_3.mp3` | Salonda daha sertini yedim. | — |
| `hit_body_4.mp3` | Vur vur, ödeme yine düşük. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | Silah kolum o! | — |
| `hit_arm_2.mp3` | O elle kart dağıtıyorum! | — |
| `hit_arm_3.mp3` | Bileğim! Çekişim yavaşlar! | — |
| `hit_arm_4.mp3` | Kolumu bırak, makarayı o çeviriyor. | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Çizmem! Mahmuzu eğdin! | — |
| `hit_leg_2.mp3` | Dizim! Ata nasıl bineceğim? | — |
| `hit_leg_3.mp3` | Bacağıma vurma, kaçmam lazım birazdan. | — |
| `hit_leg_4.mp3` | Topal haydut mu olur? | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın. Hat tutmadı. | — |
| `miss_2.mp3` | Boşa çektin. Düelloyu kaybettin. | — |
| `miss_3.mp3` | Yaklaştı ama bağlanmadı. Tanıdık geldi mi? | — |
| `miss_4.mp3` | Havaya ateş. Kasabada yasak. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Muşta mı? Salon kavgası mı bu? | — |
| `weapon_knuckles_2.mp3` | Demir yumruk. Ödemeyi yükseltmez. | — |
| `weapon_knuckles_3.mp3` | Onu rehine verseydin beş x ederdi. | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O kılıç bu kasabanın değil, yabancı. | — |
| `weapon_katana_2.mp3` | Kılıçla düelloya mı geldin? Cesursun. | — |
| `weapon_katana_3.mp3` | Kes bakalım. Hat yine tutmaz. | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | Hah! Sonunda düello! Dur, benimki boş. | — |
| `weapon_gun_2.mp3` | Tabanca mı çektin? Onu ben satmıştım sana, bozuk. | — |
| `weapon_gun_3.mp3` | İndir onu! Ölü haydut hiç ödemez! | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | O ne? Fener mi? Gece soygununa mı gidiyoruz? | — |
| `weapon_saber_2.mp3` | Bu kasabada öyle silah yok. Ruhsatı var mı? | — |
| `weapon_saber_3.mp3` | Tamam, sakin. O şey şapkamı yakar. | — |

### weapon_saw

Oyuncu testereyi çalıştırdı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saw_1.mp3` | Testere mi? Marangoz musun, cellat mı? | — |
| `weapon_saw_2.mp3` | Kapat şunu, atlar ürküyor! | — |
| `weapon_saw_3.mp3` | Onunla tabut yaparlar. Bana mı ölçü alıyorsun? | — |

### weapon_slap

Oyuncu Osmanlı tokadını seçti (elini açtı).

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_slap_1.mp3` | O el ne? Düelloda tokat olmaz! | — |
| `weapon_slap_2.mp3` | Tokat mı? Şapkam uçar! | — |
| `weapon_slap_3.mp3` | Avucunu aç bakalım... kapat, kapat. | — |

### buried

Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `buried_1.mp3` | Mezarımı sen mi kazdın? | — |
| `buried_2.mp3` | Kasabanın altına indim! Çıkarın! | — |
| `buried_3.mp3` | Çizmelerim nerede? Aşağıda kaldı! | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Tabancayı neyle çekeceğim? | — |
| `sever_arm_2.mp3` | O kolun başına ödül vardı! | — |
| `sever_arm_3.mp3` | Tek kolla da eksik öderim, merak etme. | — |
| `sever_arm_4.mp3` | Bunu ilan tahtasına yazdıracağım! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Çizmesi yeniydi! | — |
| `sever_leg_2.mp3` | Nasıl kaçacağım şimdi? | — |
| `sever_leg_3.mp3` | At bile acıdı halime. | — |
| `sever_leg_4.mp3` | Bu düello kurallarında yoktu! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Çarpan arttı. Kâğıt üstünde. Eline geçen başka. | — |
| `offer_small_2.mp3` | Büyük yazdım, küçük ödüyorum. Alış. | — |
| `offer_small_3.mp3` | Bak yükseldi. Yirmide birini alırsın. | — |
| `offer_small_4.mp3` | Söz büyük, kese küçük. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Yüz x yazıyor. Beş x veririm. Pazarlık yok. | — |
| `offer_mid_2.mp3` | Güzel rakam, değil mi? Bakması bedava. | — |
| `offer_mid_3.mp3` | Kasayı mı soyacaksın? Onu ben yaparım. | — |
| `offer_mid_4.mp3` | Bu kadarını yazarım. Ödemek ayrı iş. | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Bin x yazdım! Elli veririm! Yeter ki dur! | — |
| `offer_big_2.mp3` | Bu kadar büyük yalanı ben bile söylemedim! | — |
| `offer_big_3.mp3` | Patron beni asar bu rakama... | — |
| `offer_big_4.mp3` | Daha ne istiyorsun? Tam ödeme mi? Güldürme! | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun. Rakam da düştü, ödeme de. | — |
| `recover_2.mp3` | Bıraktın ya, sözümü geri alıyorum. | — |
| `recover_3.mp3` | Geçti. Haydutlar çabuk toparlanır. | — |
| `recover_4.mp3` | Durursan düşer. Düşük ödeme daha da düşer. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem beş x'i de alamazsın! | — |
| `near_death_2.mp3` | Ölü haydut ödeme yapmaz! Diri de pek yapmıyor ama! | — |
| `near_death_3.mp3` | Yavaş! Kasanın şifresi bende! | — |
| `near_death_4.mp3` | Bir vuruş daha ve ödülümü başkası alır. | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkadan mı? Bu kasabada bile ayıp sayılır! | — |
| `aloof_hit_2.mp3` | Seni görmüyordum. Şimdi görüyorum, afişini astıracağım. | — |
| `aloof_hit_3.mp3` | Hop! Makaraya bakıyordum! | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın mı? Saysana. Eksik, değil mi? Heh. | — |
| `cashout_2.mp3` | Akıllısın. Yirmide birine razı oldun. | — |
| `cashout_3.mp3` | Güle güle. Yarın yine eksik öderim. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Tamam! Tamam! Beş VS! Hepsi hatta! Al! | — |
| `maxwin_2.mp3` | Pes! Kasa senin! Tam ödeme, kuruşu kuruşuna! | — |
| `maxwin_3.mp3` | Al, git, kasabama bir daha ayak basma! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Beş... VS... geliyordu... | — |
| `death_2.mp3` | Ölü... haydut... ödemez... | — |
| `death_3.mp3` | Hat... tutmadı... | — |

## Şimşek Dede — 104 replik

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

### weapon_slap

Oyuncu Osmanlı tokadını seçti (elini açtı).

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_slap_1.mp3` | O el niye açıldı evlat? Kapat onu. | — |
| `weapon_slap_2.mp3` | Tokat mı? Tanrıya tokat atılmaz! | — |
| `weapon_slap_3.mp3` | O avuç ayası bana fazla büyük geldi. | — |

### buried

Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `buried_1.mp3` | Bulutlardan indim... yerin dibine girdim! | — |
| `buried_2.mp3` | Çıkar beni buradan! Sakalım toprak oldu! | — |
| `buried_3.mp3` | Yeraltı tanrısı ben değildim! | — |

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
