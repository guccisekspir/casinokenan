# Ses dosyaları

Toplam **243** replik, kaydı olan: **0**.

Bu dosya `npm run voice-list` ile üretilir; elle düzenlemeyin. Replikleri değiştirmek için
`src/lines/<karakter>.json` dosyalarını düzenleyip komutu yeniden çalıştırın.

- Biçim: **mp3**, mono, tek replik = tek dosya, baştaki/sondaki sessizlik kırpılmış.
- Konum: `public/audio/<karakter>/<olay>_<n>.mp3`
- Dosyası olmayan replik oyunda tarayıcının sesli okumasıyla söylenir; yani kayıtlar parça parça eklenebilir.
- Her olayın alternatifleri vardır; oyun hepsini söylemeden hiçbirini tekrar etmez.

## Firavun Bey — 74 replik

Klasör: `public/audio/firavun-bey/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Mezarıma hoş geldin fani. Kitap açıldı ve sana iki x yazdı. | — |
| `intro_2.mp3` | Üç bin yıl bekledim, sana vereceğim şey belli: iki x. | — |
| `intro_3.mp3` | Yine mi sen? Kader değişmez. İki x. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Kitap açıldı... en düşük sembol seçildi. Kader. | — |
| `idle_1_2.mp3` | Üç bin yıldır bekliyorum. Sen de bir bonus bekle. | — |
| `idle_1_3.mp3` | Risk al, ikiye katla! Ya da hepsini bana bırak. | — |
| `idle_1_4.mp3` | Bu mezara giren bakiyesiz çıkar. | — |
| `idle_1_5.mp3` | İki kitap geldi. Üçüncüsü piramitte kaldı. | — |
| `idle_1_6.mp3` | Lanetli değilim. Yalnızca RTP düşük. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Mezar soyguncuları bile daha kibardı. | — |
| `idle_2_2.mp3` | Bin yıllık lanet isteyen böyle davranır. | — |
| `idle_2_3.mp3` | Kitapta böyle bir özellik yok! | — |
| `idle_2_4.mp3` | Kayıp senin kaderindi. Ben yalnızca yazdım. | — |
| `idle_2_5.mp3` | Bana vurma, sağlayıcıya vur! | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Dur! Genişleyen sembol veriyorum! | — |
| `idle_3_2.mp3` | Üç bin yıl bekledim... bunun için mi? | — |
| `idle_3_3.mp3` | Kum saati benim için de akıyormuş. | — |
| `idle_3_4.mp3` | Hazinenin yerini söylerim, yeter ki vurma! | — |
| `idle_3_5.mp3` | Firavunlar yalvarmaz... ama rica ediyorum. | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Başlığım! Altın o! | — |
| `hit_head_2.mp3` | Mumyaya el kalkmaz! | — |
| `hit_head_3.mp3` | Sakalım takmaydı, düşürme! | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Sargılarım çözülüyor! | — |
| `hit_body_2.mp3` | Uf! Üç bin yıllık belim! | — |
| `hit_body_3.mp3` | Vurdukça kum çıkar, x çıkmaz. | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | O kol müzelik! | — |
| `hit_arm_2.mp3` | Bileğimdeki sargı bin yıllık, çözme! | — |
| `hit_arm_3.mp3` | Elimdeki mühür düşecek! | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Dizim zaten tozdu! | — |
| `hit_leg_2.mp3` | Yavaş, kırılırım, antikayım! | — |
| `hit_leg_3.mp3` | O bacak piramit merdiveni çıktı, saygı göster! | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın. Kader böyle yazmış. | — |
| `miss_2.mp3` | Kitap yine kapandı. | — |
| `miss_3.mp3` | Boşa salladın fani. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | Demir mi? Biz tunç çağını bile gördük. | — |
| `weapon_knuckles_2.mp3` | Muştayla lanet kırılmaz. | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O kılıç bu toprakların değil. Uzak dur. | — |
| `weapon_katana_2.mp3` | Kes, ama sargıdan kes, etten değil! | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | O ateş püsküren şey ne? Büyü mü? | — |
| `weapon_gun_2.mp3` | İndir onu! Ölü firavun... neyse, yine de indir. | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | Ra'nın ışığı mı bu? Olamaz! | — |
| `weapon_saber_2.mp3` | Güneşi kılıç yapmışsın. Saygısız! | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | O parça müzelikti! | — |
| `sever_arm_2.mp3` | Onu üç bin yıldır taşıyordum! | — |
| `sever_arm_3.mp3` | Kumum dökülüyor! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Öbür dünyaya nasıl yürüyeceğim? | — |
| `sever_leg_2.mp3` | O bacak mühürlüydü! | — |
| `sever_leg_3.mp3` | Lanet olsun... gerçekten, lanet! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Al, biraz x. Tanrılar cömert. | — |
| `offer_small_2.mp3` | Arttı. Kader bugün sana gülümsüyor, az. | — |
| `offer_small_3.mp3` | Bu kadarı faniye yeter. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Peki, biraz daha. Ama mezarı rahat bırak. | — |
| `offer_mid_2.mp3` | Bu ciddi altın. Al, git. | — |
| `offer_mid_3.mp3` | Hazineyi mi boşaltacaksın? | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Al! Piramit de senin olsun! | — |
| `offer_big_2.mp3` | Bu kadar altını ben bile gömmedim! | — |
| `offer_big_3.mp3` | Rahipler beni mumyalayacak. Yine. | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun. Kum yine üstüme doldu. | — |
| `recover_2.mp3` | Çarpan da gömülüyor bak. | — |
| `recover_3.mp3` | Geçti. Ben zaten ölüyüm, alışığım. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! İkinci kez ölürsem ödeme yok! | — |
| `near_death_2.mp3` | Mühür kırılırsa hazine de gider! | — |
| `near_death_3.mp3` | Yavaş fani, altının anahtarı bende! | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkamdan mı? Soyguncu işi bu! | — |
| `aloof_hit_2.mp3` | Kitabımı okuyordum, saygısız! | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın, kaçtın. Hazine yine bende kaldı. | — |
| `cashout_2.mp3` | Akıllı fani. Ama kader beni seçti. | — |
| `cashout_3.mp3` | Git. Mezar seni yine çağıracak. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Yeter! Hazine senin... max win! | — |
| `maxwin_2.mp3` | Pes! Kitabın bütün sayfaları senin! | — |
| `maxwin_3.mp3` | Al, git, lanetimi de götür! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Kasa... ebedîdir... | — |
| `death_2.mp3` | Yine... toz... oldum... | — |
| `death_3.mp3` | Ölü firavun... ödemez... | — |

## Şeker Prenses — 74 replik

Klasör: `public/audio/seker-prenses/`

### intro

Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `intro_1.mp3` | Hoş geldin tatlım! Bak sana ne verdim: iki x! Çok tatlıyım değil mi? | — |
| `intro_2.mp3` | Ay yine mi sen? Neyse, al iki x, ağlama. | — |
| `intro_3.mp3` | Şeker Diyarı'na hoş geldin! Hediyen hazır: koca bir iki x. | — |

### idle_1

I. perde (Kibir): oyuncu beklerken kışkırtma.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_1_1.mp3` | Aaa, yine tumble olmadı! Çok üzüldüm. Hiç üzülmedim. | — |
| `idle_1_2.mp3` | Bomba geldi ama kazanç yoktu. Ne tatlı değil mi? | — |
| `idle_1_3.mp3` | Canım, kasa hep kazanır. Kasa benim. | — |
| `idle_1_4.mp3` | Yükleme bonusu ister misin? Çevrim şartı sadece kırk kat! | — |
| `idle_1_5.mp3` | Üç scatter geldi. Dördüncüyü ben yedim. | — |
| `idle_1_6.mp3` | Bugün şanslı günün! Şaka şaka. | — |

### idle_2

II. perde (Öfke): azar, inkâr.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_2_1.mp3` | Ay sen ciddi misin şu an? | — |
| `idle_2_2.mp3` | Bana bak, destek hattını ararım! | — |
| `idle_2_3.mp3` | Kaybeden hep böyle huysuz olur zaten. | — |
| `idle_2_4.mp3` | Ben sana oyna demedim ki, kendin geldin! | — |
| `idle_2_5.mp3` | Elbisem leke oldu! Bunu bakiyenden keserim. | — |

### idle_3

III. perde (Yakarış): yalvarma, pazarlık.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `idle_3_1.mp3` | Tamam canım, sakin ol, free spin vereyim! | — |
| `idle_3_2.mp3` | Şekerim eriyor... beni kim hatırlayacak? | — |
| `idle_3_3.mp3` | Ben de kazanmak isterdim. Bir kere olsun. | — |
| `idle_3_4.mp3` | Dur! Çarpan bombası atacağım, söz! | — |
| `idle_3_5.mp3` | Prensese böyle davranılmaz... | — |

### hit_head

Kafasına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_head_1.mp3` | Ay! Saçım! | — |
| `hit_head_2.mp3` | Tacıma dokunma! | — |
| `hit_head_3.mp3` | Makyajım aktı, kaba şey! | — |

### hit_body

Gövdesine vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_body_1.mp3` | Bu da ödemez tatlım. | — |
| `hit_body_2.mp3` | Iyy! Elin yapış yapış oldu! | — |
| `hit_body_3.mp3` | Elbiseme dikkat et, kiralık! | — |

### hit_arm

Koluna / eline vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_arm_1.mp3` | Kolum! Yeni manikür yaptırmıştım! | — |
| `hit_arm_2.mp3` | Ay, morarır şimdi orası! | — |
| `hit_arm_3.mp3` | Bileziğim düştü, kaba şey! | — |

### hit_leg

Bacağına / ayağına vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `hit_leg_1.mp3` | Topuklu ayakkabım kırıldı! | — |
| `hit_leg_2.mp3` | Çorabım kaçtı! | — |
| `hit_leg_3.mp3` | Bacağıma vurma, dans edeceğim daha! | — |

### miss

Oyuncu ıskaladı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `miss_1.mp3` | Iskaladın tatlım. Tumble gibi. | — |
| `miss_2.mp3` | Az kalsın! Hep az kalsın. | — |
| `miss_3.mp3` | Havayı dövüyorsun, çok şirin. | — |

### weapon_knuckles

Oyuncu muştayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_knuckles_1.mp3` | O ne öyle, yüzük mü? Çok zevksiz. | — |
| `weapon_knuckles_2.mp3` | Muşta mı? Ne kadar kabasın! | — |

### weapon_katana

Oyuncu katanayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_katana_1.mp3` | O bıçak pasta kesmek için mi? Lütfen öyle olsun. | — |
| `weapon_katana_2.mp3` | Ay o çok sivri! Uzak tut! | — |

### weapon_gun

Oyuncu tabancayı eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_gun_1.mp3` | Tabanca mı? Burası şeker dükkânı! | — |
| `weapon_gun_2.mp3` | İndir onu, şeker patlar! | — |

### weapon_saber

Oyuncu ışın kılıcını eline aldı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `weapon_saber_1.mp3` | O parlayan şey ne? Lolipop mu? | — |
| `weapon_saber_2.mp3` | Tamam tamam, ışığını söndür, konuşalım. | — |

### sever_arm

Kolu / ön kolu koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_arm_1.mp3` | Kolum! Onunla el sallıyordum! | — |
| `sever_arm_2.mp3` | Şurubum akıyor! | — |
| `sever_arm_3.mp3` | O benim en tatlı tarafımdı! | — |

### sever_leg

Bacağı / baldırı koptu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `sever_leg_1.mp3` | Bacağım! Nasıl dans edeceğim? | — |
| `sever_leg_2.mp3` | O ayakkabının teki pahalıydı! | — |
| `sever_leg_3.mp3` | Prensesler topallamaz! | — |

### offer_small

Çarpan yükseldi (5x – 25x): hâlâ alaycı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_small_1.mp3` | Al biraz x, sus artık. | — |
| `offer_small_2.mp3` | Bak arttı. Ne kadar cömertim! | — |
| `offer_small_3.mp3` | Bu kadarı sana fazla bile tatlım. | — |

### offer_mid

Çarpan yükseldi (50x – 250x): gönülsüz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_mid_1.mp3` | Tamam tamam, biraz daha. Ama kimseye söyleme. | — |
| `offer_mid_2.mp3` | Bu güzel bir çarpan. Al ve git. | — |
| `offer_mid_3.mp3` | Dükkânı mı boşaltacaksın? | — |

### offer_big

Çarpan yükseldi (500x ve üstü): çaresiz.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `offer_big_1.mp3` | Al hepsini! Yeter ki dokunma! | — |
| `offer_big_2.mp3` | Bu kadar şeker dişini çürütür! | — |
| `offer_big_3.mp3` | Kraliçe beni öldürecek... | — |

### recover

Oyuncu durdu, çarpan geri düştü: yine kibirlenir.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `recover_1.mp3` | Durdun mu? Çarpan da eridi bak. | — |
| `recover_2.mp3` | Bıraktın, x'ler geri gidiyor tatlım. | — |
| `recover_3.mp3` | Geçti bile. Ben şekerim, yapışır iyileşirim. | — |

### near_death

Canı çok azaldı: "ölürsem ödeme yok" uyarısı.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `near_death_1.mp3` | Dur! Ölürsem ödeme yok! | — |
| `near_death_2.mp3` | Bir vuruş daha ve şeker de biter, para da! | — |
| `near_death_3.mp3` | Yavaş! Kasanın anahtarı bende! | — |

### aloof_hit

Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `aloof_hit_1.mp3` | Arkamdan mı vuruyorsun? Çok ayıp! | — |
| `aloof_hit_2.mp3` | Seni görmezden geliyordum, bozma! | — |

### cashout

Oyuncu teklifi alıp çıktı: alay eder.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `cashout_1.mp3` | Aldın mı? Korkak şey. Max win çok yakındı. | — |
| `cashout_2.mp3` | Akıllıca. Ama asıl şeker bende kaldı. | — |
| `cashout_3.mp3` | Güle güle tatlım. Yine gelirsin. | — |

### maxwin

Pes etti, max win veriyor.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `maxwin_1.mp3` | Peki peki! Al max win senin olsun, kaba şey! | — |
| `maxwin_2.mp3` | Pes! Bütün şekerler senin! | — |
| `maxwin_3.mp3` | Al, git, tacımı da bırak! | — |

### death

Öldü (oyuncu kaybetti): son sözleri.

| Dosya | Replik | Kayıt |
| --- | --- | --- |
| `death_1.mp3` | Şeker... bitti... | — |
| `death_2.mp3` | Kasa... hep... tatlıdır... | — |
| `death_3.mp3` | Ölü prenses... ödemez... | — |

## Şimşek Dede — 95 replik

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
