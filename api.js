const path = require("path");
const fs = require("fs");

class API {
    api(req, res) {
        res.send({
            "ayet": "/api/ayet/{sure_no}:{ayet_no}",
            "sure": "/api/sure/{sure_no}"
        })
    }

    user(req, res) {}

    async ayah(req, res) {
        try {
            const sureNo = req.params.ayah.split(":")[0];
            const ayetNo = req.params.ayah.split(":")[1];

            const remoteUrl = `https://kurancilar.github.io/json/sure/${sureNo}.json`;
            const response = await fetch(remoteUrl);

            if (!response.ok) {
                return res.status(500).send("Sûre alınamadı");
            }

            const sureData = await response.json();

            // JSON yapısı: sureData.verses[]
            if (!sureData.verses || !Array.isArray(sureData.verses)) {
                return res.status(500).send("Bu sûrede 'verses' listesi yok");
            }

            // Ayeti bul
            const ayetObj = sureData.verses.find(v => 
                String(v.verseNumber) === String(ayetNo)
            );

            if (!ayetObj) {
                return res.status(404).send("Ayet bulunamadı");
            }

            // Kullanışlı bir çıktı modeline dönüştür
            return res.json({
                id: ayetObj.id,
                sureNo: Number(sureNo),
                verseNumber: ayetObj.verseNumber,
                verseKey: ayetObj.verseKey,
                arabic: ayetObj.arabic,
                english: ayetObj.english,
                turkish: ayetObj.turkish,
                audio: ayetObj.audio
            });

        } catch (err) {
            res.status(500).send("Hata: " + err.message);
        }
    }

    async ayah2(req, res) {
        try {
            const sureNo = req.params.sure;
            const ayetNo = req.params.ayet;

            const remoteUrl = `https://kurancilar.github.io/json/sure/${sureNo}.json`;
            const response = await fetch(remoteUrl);

            if (!response.ok) {
                return res.status(500).send("Sûre alınamadı");
            }

            const sureData = await response.json();

            // JSON yapısı: sureData.verses[]
            if (!sureData.verses || !Array.isArray(sureData.verses)) {
                return res.status(500).send("Bu sûrede 'verses' listesi yok");
            }

            // Ayeti bul
            const ayetObj = sureData.verses.find(v => 
                String(v.verseNumber) === String(ayetNo)
            );

            if (!ayetObj) {
                return res.status(404).send("Ayet bulunamadı");
            }

            // Kullanışlı bir çıktı modeline dönüştür
            return res.json({
                id: ayetObj.id,
                sureNo: Number(sureNo),
                verseNumber: ayetObj.verseNumber,
                verseKey: ayetObj.verseKey,
                arabic: ayetObj.arabic,
                english: ayetObj.english,
                turkish: ayetObj.turkish,
                audio: ayetObj.audio
            });

        } catch (err) {
            res.status(500).send("Hata: " + err.message);
        }
    }



    async sure(req, res) {
        try {
            const remoteUrl = `https://kurancilar.github.io/json/sure/${req.params.sure}.json`;
            const response = await fetch(remoteUrl);

            if (!response.ok) {
                return res.status(500).send('Uzak dosya alınamadı');
            }

            // Header kopyala
            res.set('Content-Type', response.headers.get('content-type') || 'application/json');

            const dispo = response.headers.get('content-disposition');
            if (dispo) res.set('Content-Disposition', dispo);

            // Web ReadableStream → Reader
            const reader = response.body.getReader();

            // Web stream'i manuel olarak Node response'a akıtıyoruz
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(Buffer.from(value));
                }
                res.end();
            };

            pump().catch(err => {
                console.error(err);
                res.status(500).end("Stream hatası");
            });

        } catch (err) {
            res.status(500).send('Hata oluştu: ' + err.message);
        }
    }

    dontShowAgain(req, res) {
        res.send("0");
    }
}

module.exports = API;