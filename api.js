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
        let ayetKey = req.params.ayah;
        let sure = ayetKey.split(":")[0];
        let ayet = ayetKey.split(":")[1];

        fs.readFile(
            path.join(__dirname, "public", "data", "verses", `${
                sure
            }.json`), "utf-8", (err, data) => {
                if (err) {
                    console.error("File not found: ", err);
                    res.send({
                        "error": "Sure not found"
                    })
                    return;
                }

                let dat = JSON.parse(data);
                let result = dat.verses[ayet - 1];

                result.turkish = {};

                let omer = JSON.parse(fs.readFileSync(
                    path.join(__dirname, "public", "data", "mealler", "omer-nasuhi-bilmen.json"), "utf-8"
                ))

                result.turkish.omer_nasuhi_bilmen =
                    omer.sures[sure - 1].ayetler[ayet - 1][1];
                
                let hayrat = JSON.parse(fs.readFileSync(
                    path.join(__dirname, "public", "data", "mealler", "hayrat-nesriyat.json"), "utf-8"
                ))

                result.turkish.hayrat_nesriyat =
                    hayrat.sures[sure - 1].ayetler[ayet - 1][1];

                let diyanet = JSON.parse(fs.readFileSync(
                    path.join(__dirname, "public", "data", "mealler", "diyanet-vakfi.json"), "utf-8"
                ))

                result.turkish.diyanet_vakfi =
                    diyanet.sures[sure - 1].ayetler[ayet - 1][1];

                res.json(result);
            }
        )
    }

    sure(req, res) {
        const x = JSON.parse(fs.readFileSync(
            path.join(__dirname, "public", "data", "verses", `${
                req.params.sure
            }.json`)
        ))



        x.verses.forEach(y => {
            y.turkish = {};

            let omer = JSON.parse(fs.readFileSync(
                path.join(__dirname, "public", "data", "mealler", "omer-nasuhi-bilmen.json"), "utf-8"
            ))

            y.turkish.omer_nasuhi_bilmen =
                omer.sures[req.params.sure - 1].ayetler[x.verses.indexOf(y)][1];
                
            let hayrat = JSON.parse(fs.readFileSync(
                path.join(__dirname, "public", "data", "mealler", "hayrat-nesriyat.json"), "utf-8"
            ))

            y.turkish.hayrat_nesriyat =
                hayrat.sures[req.params.sure - 1].ayetler[x.verses.indexOf(y)][1];

            let diyanet = JSON.parse(fs.readFileSync(
                path.join(__dirname, "public", "data", "mealler", "diyanet-vakfi.json"), "utf-8"
            ))

            y.turkish.diyanet_vakfi =
                diyanet.sures[req.params.sure - 1].ayetler[x.verses.indexOf(y)][1];
        })

        res.json(x);
    }
    dontShowAgain(req, res) {
        res.send("0");
    }
}

module.exports = API;