class API {
    api(req, res) {
        res.send({
            "api": "closed"
        })
    }
}

module.exports = API;