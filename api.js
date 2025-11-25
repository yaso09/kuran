const app = require("./links");
const path = require("path");
const fs = require("fs");
const { get } = require("http");

class API {
    api(req, res) {
        res.send({
            "api": "closed"
        })
    }

    user(req, res) {}

    async ayayh(req, res) {
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
        res.sendFile(
            path.join(__dirname, "public", "data", "verses", `${
                req.params.sure
            }.json`)
        )
    }

    constructor() {
        app.get("/api", this.api);
        app.get("/api/user/:param", this.user);
        app.get("/api/ayet/:ayah", this.ayah);
        app.get("/api/sure/:sure", this.sure);
    }
}

module.exports = API;