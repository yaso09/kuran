
![](/images/logo-dark.png)

![](/images/logo-white.png)

  

# Kur'an-ı Kerîm Okuyucu

[Site](https://kuran.yasireymen.com)

İnternetten ücretsiz mealli Kur'an-ı Kerîm okuyun. Tam anlamıyla Allah rızası için babamın hayrına yapıyorum. Mealleri [buradan](https://github.com/alialparslan/Kuran-Meali-Ebook-Olusturucu) ve Arapça aslı ile İngilizce meali de [buradan](https://github.com/subaanqasim/quran-to-obsidian) aldım.


![](/images/streak-ss.png)

## iFrame İçinde Ayet Gösterme

[`/embed.html`](https://kuran.yasireymen.com/embed.html)

## API Kullanımı

#### Ayet Çekmek İçin

<details>
    <summary>
        <code>GET</code> <code>/api/ayet/{sure_no}:{ayet_no}</code>
    </summary>

Örnek Çıktı:

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
</details>

## Özellikler

 - [x] Okuma serisi
 - [x] Ömer Nasuhi Bilmen meali
 - [x] Hayrat Neşriyat meali
 - [x] Diyanet Vakfı meali
 - [ ] Elmalılı Hamdi Yazır meali
 - [ ] Abdulbaki Gölpınarlı meali
 - [ ] Sure yazdırma özelliği
 - [ ] Ayet yazdırma özelliği
 - [ ] Fihrist