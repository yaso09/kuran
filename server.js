const API = require("./api");
const app = require("./links");

const api = new API();

app.get("/api", api.api);
app.get("/api/user/:param", api.user);
app.get("/api/ayet/:ayah", api.ayah);
app.get("/api/sure/:sure", api.sure);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
})