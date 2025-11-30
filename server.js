const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
// const ClerkExpressRequireAuth = require("@clerk/express");

const app = express();

const PUBLIC_DIR = path.join(__dirname, "public");

// app.use(ClerkExpressRequireAuth.clerkMiddleware);
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

const API = require("./api");
const api = new API();

app.get("/api", api.api);
app.get("/api/user/:param", api.user);
app.get("/api/ayet/:ayah", api.ayah);
app.get("/api/sure/:sure", api.sure);
app.get("/api/dontShowAgain", api.dontShowAgain);

app.get("/audio/:sure/:ayet", async (req, res) => {
    try {
        const remoteUrl = `https://yaso09.github.io/kuranaudio/audio/${req.params.sure}/${req.params.ayet}.mp3`;
        
        const response = await fetch(remoteUrl);

        if (!response.ok) {
            res.status(500).send('Uzak dosya alınamadı');
        }

        // İçerik tipini uzak sunucudan kopyala
        res.set('Content-Type', response.headers.get('content-type'));
        
        // Gerekirse dosya ismi
        const dispo = response.headers.get('content-disposition');
        if (dispo) res.set('Content-Disposition', dispo);

        // Stream olarak ilet — en sağlıklısı
        response.body.pipe(res);
        
    } catch (err) {
        res.status(500).send('Hata oluştu: ' + err.message);
    }
})

app.get("/docs", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "docs", "index.html"));
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
})