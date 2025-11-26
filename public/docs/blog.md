![](/images/logo-dark.png)

  

# Kur'an-ı Kerîm Okuyucu

Mealleri [buradan](https://github.com/alialparslan/Kuran-Meali-Ebook-Olusturucu) ve Arapça aslı ile İngilizce meali de [buradan](https://github.com/subaanqasim/quran-to-obsidian) aldım.

![](/images/streak-ss.png)

## Geliştirici Modu

Geliştirici modu ile localStorage'e kaydedilen verileri ekranın sol üst köşesinden takip edebilirsiniz.
`CTRL + ENTER` kısayolunu iki defa çağırarak açabilirsiniz.

## Ayet Gömme

Ayetlerin altındaki "🔗 Göm" tuşuna basarak gömme kodunu kopyalayabilirsiniz.

![](/images/vid1.gif)

Örnek olarak besmeleyi kopyaladığınızda şu HTML kodunu kopyalar:

```html
<iframe onload="
window.addEventListener('message', function(e) {
if (e.data.embedHeight && e.data.name == '1:1') {
document.getElementById('kuranEmbed1:1').style.height =
e.data.embedHeight + 'px';
}})" scrolling="no" width="100%" frameborder=0
id="kuranEmbed1:1"
allowtransparency="true"
src="https://kuran.yasireymen.com/embed?sure=1&ayet=1&meal=diyanet-vakfi"
frameborder="0"></iframe>            
```

#### Gömme Bağlantısı Oluşturma

[`https://kuran.yasireymen.com/embed`](https://kuran.yasireymen.com/embed) adresi üzerinden gömme bağlantısı oluşturulur.

| Değer | Parametre |
|--|--|
| Sure | `sure` |
| Ayet | `ayet` |
| Meal | `meal` |

## API Kullanımı

#### Ayet Çekmek İçin

`GET` [`/api/ayet/{sure_no}:{ayet_no}`](https://kuran.yasireymen.com/api/ayet/1:1)

| Değer | Özellik |
|--|--|
| Ayet ID'si | `id` `integer` |
| Ayet numarası | `verseNumber` `string` |
| Arapçası | `arabic` `string` |
| İngilizcesi [(quran.com)](quran.com) | `english` `string` |
| Türkçe mealler | `turkish` `object` |

Örnek yanıt:

```json
{
    "id": 1,
    "verseNumber": 1,
    "verseKey": "1:1",
    "arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    "english": "In the Name of Allah—the Most Compassionate, Most Merciful.",
    "turkish": {
        "omer_nasuhi_bilmen": "Rahmân ve Rahîm olan Allah Teâlâ’nın ismiyle (tilâvete başlarım).",
        "hayrat_nesriyat": "Rahmân, Rahîm olan Allah`ın ismiyle.",
        "diyanet_vakfi": "Rahmân ve rahîm olan Allah’ın adıyla."
    }
}
```

#### Sure Çekmek İçin

`GET` [`/api/sure/{sure_no}`](https://kuran.yasireymen.com/api/sure/1)

| Değer | Özellik |
|-|-|
| Ayetler | `verses` `array` |

Örnek yanıt:

```json
{
  "verses": [
    {
      "id": 1,
      "verseNumber": 1,
      "verseKey": "1:1",
      "arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "english": "In the Name of Allah—the Most Compassionate, Most Merciful.",
      "turkish": {
        "omer_nasuhi_bilmen": "Rahmân ve Rahîm olan Allah Teâlâ’nın ismiyle (tilâvete başlarım).",
        "hayrat_nesriyat": "Rahmân, Rahîm olan Allah`ın ismiyle.",
        "diyanet_vakfi": "Rahmân ve rahîm olan Allah’ın adıyla."
      }
    },
    {
      "id": 2,
      "verseNumber": 2,
      "verseKey": "1:2",
      "arabic": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
      "english": "All praise is for Allah—Lord of all worlds,\u003Csup foot_note=76373\u003E1\u003C/sup\u003E",
      "turkish": {
        "omer_nasuhi_bilmen": "(2-4) Hamd, âlemlerin Rabbi, Rahmân ve Rahîm olup, ceza gününün mâliki olan Allah Teâlâ’ya mahsustur.",
        "hayrat_nesriyat": "Hamd, âlemlerin Rabbi olan Allah`a mahsustur.",
        "diyanet_vakfi": "Hamd (övme ve övülme), âlemlerin Rabbi Allah’a mahsustur."
      }
    },
    {
      "id": 3,
      "verseNumber": 3,
      "verseKey": "1:3",
      "arabic": "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "english": "the Most Compassionate, Most Merciful,",
      "turkish": {
        "omer_nasuhi_bilmen": "(2-4) Hamd, âlemlerin Rabbi, Rahmân ve Rahîm olup, ceza gününün mâliki olan Allah Teâlâ’ya mahsustur.",
        "hayrat_nesriyat": "(O,) Rahmândır, Rahîmdir.",
        "diyanet_vakfi": "O, rahmândır ve rahîmdir."
      }
    },
    {
      "id": 4,
      "verseNumber": 4,
      "verseKey": "1:4",
      "arabic": "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
      "english": "Master of the Day of Judgment.",
      "turkish": {
        "omer_nasuhi_bilmen": "(2-4) Hamd, âlemlerin Rabbi, Rahmân ve Rahîm olup, ceza gününün mâliki olan Allah Teâlâ’ya mahsustur.",
        "hayrat_nesriyat": "Dîn (hesab) gününün mâlikidir.",
        "diyanet_vakfi": "Ceza gününün mâlikidir."
      }
    },
    {
      "id": 5,
      "verseNumber": 5,
      "verseKey": "1:5",
      "arabic": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "english": "You ˹alone˺ we worship and You ˹alone˺ we ask for help.",
      "turkish": {
        "omer_nasuhi_bilmen": "Ya Rabbi! Yalnız Sana ibadet ederiz, ancak Sen’den yardım dileriz.",
        "hayrat_nesriyat": "(Rabbimiz!) Ancak sana ibâdet ederiz ve ancak senden yardım dileriz.",
        "diyanet_vakfi": "(Rabbimiz!) Ancak sana kulluk ederiz ve yalnız senden medet umarız."
      }
    },
    {
      "id": 6,
      "verseNumber": 6,
      "verseKey": "1:6",
      "arabic": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      "english": "Guide us along the Straight Path,",
      "turkish": {
        "omer_nasuhi_bilmen": "(6-7) Bizleri doğru yola hidâyet et, o kendilerine in’am etmiş olduğun zâtların yoluna ilet, gazaba uğramışların ve sapık bulunmuşların yoluna değil.",
        "hayrat_nesriyat": "Bizi doğru olan yola ilet.",
        "diyanet_vakfi": "Bize doğru yolu göster."
      }
    },
    {
      "id": 7,
      "verseNumber": 7,
      "verseKey": "1:7",
      "arabic": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      "english": "the Path of those You have blessed—not those You are displeased with, or those who are astray.\u003Csup foot_note=76374\u003E1\u003C/sup\u003E ",
      "turkish": {
        "omer_nasuhi_bilmen": "(6-7) Bizleri doğru yola hidâyet et, o kendilerine in’am etmiş olduğun zâtların yoluna ilet, gazaba uğramışların ve sapık bulunmuşların yoluna değil.",
        "hayrat_nesriyat": "Kendilerine ni`met verdiğin kimselerin yoluna; gazab edilmiş olanların ve dalâlete düşenlerin (yoluna) değil! (Âmîn!)",
        "diyanet_vakfi": "Kendilerine lütuf ve ikramda bulunduğun kimselerin yolunu; gazaba uğramışların ve sapmışların yolunu değil!"
      }
    }
  ]
}
```