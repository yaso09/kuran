const app = require("./links");

class API {
    api(req, res) {
        res.send({
            "api": "closed"
        })
    }

    constructor() {
        app.get("/api", this.api);
    }
}

module.exports = API;