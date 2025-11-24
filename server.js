const API = require("./api");
const app = require("./links");

const api = new API();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
})