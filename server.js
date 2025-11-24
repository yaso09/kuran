const express = require("express");
const fs = require("fs");
const path = require("path");

const API = require("./api");

const api = new API();

const app = express();
const PORT = 3000;

const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
})

app.get("/kuran", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "kuran.html"));
})

app.get("/embed", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "embed.html"));
})

app.get("/api", api.api);

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
})