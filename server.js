const express = require("express");
const path = require("path");
const dotenv = require("dotenv/config");
const clerk = require("@clerk/express");

const app = express();

const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

app.get("/user", clerk.requireAuth(), async (req, res) => {
    clerk.clerkClient.authenticateRequest(req, {
        authorizedParties: ['https://kuran.yasireymen.com'],
    })
    const { isAuthenticated, userId } = clerk.getAuth(req);

    if (!isAuthenticated) {
        return res.status(401).json({
            error: "User not authenticated"
        })
    }

    const user = await clerk.clerkClient.users.getUser(userId);

    clerk.clerkClient.users.updateUserMetadata(userId)

    res.json(user);
})

app.get("/user/get", clerk.requireAuth(), async (req, res) => {
    const { isAuthenticated, userId } = clerk.getAuth(req);
    clerk.clerkClient.authenticateRequest(req, {
        authorizedParties: ['https://kuran.yasireymen.com'],
    })

    if (!isAuthenticated) {
        return res.status(401).json({
            error: "User not authenticated"
        })
    }

    const user = await clerk.clerkClient.users.getUser(userId);

    clerk.clerkClient.users.updateUserMetadata(userId);

    res.json(user.publicMetadata);
})

app.post("/user/set", clerk.requireAuth(), async (req, res) => {
    const { isAuthenticated, userId } = clerk.getAuth(req);
    clerk.clerkClient.authenticateRequest(req, {
        authorizedParties: ['https://kuran.yasireymen.com'],
    })
    const response = req.body;

    if (!isAuthenticated) {
        return res.status(401).json({
            error: "User not authenticated"
        })
    }

    let publicMetadata = {};
    publicMetadata[response.key] = response.value;

    await clerk.clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: publicMetadata
    })

    res.status(200).json({ success: true });
})

app.get("/user/get/:key", clerk.requireAuth(), async (req, res) => {
    const { isAuthenticated, userId } = clerk.getAuth(req);
    clerk.clerkClient.authenticateRequest(req, {
        authorizedParties: ['https://kuran.yasireymen.com'],
    })

    if (!isAuthenticated) {
        return res.status(401).json({
            error: "User not authenticated"
        })
    }

    res.status(200).json((await clerk.clerkClient.users.getUser(userId)).publicMetadata);
})

app.get("/", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
})

app.get("/hesap", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "hesap.html"));
})

app.get("/giris", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "giris.html"));
})

app.get("/kuran", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "kuran.html"));
})

app.get("/tefsir/:sure", (req, res) => {
    res.sendFile(path.join(__dirname, "data", "elmalili_tefsir", "tefsir.html"));
})

app.get("/tefsirMD/:sure", (req, res) => {
    res.sendFile(path.join(__dirname, "data", "elmalili_tefsir", "md", `${req.params.sure}.md`));
})

app.get("/embed", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "embed.html"));
})

const API = require("./api");
const { runInNewContext } = require("vm");
const { asyncWrapProviders } = require("async_hooks");
const { getActiveResourcesInfo } = require("process");
const api = new API();

app.get("/api", api.api);
app.get("/api/user/:param", api.user);
app.get("/api/ayet/:ayah", api.ayah);
app.get("/api/sure/:sure/ayet/:ayet", api.ayah2);
app.get("/api/sure/:sure", api.sure);
app.get("/api/dontShowAgain", api.dontShowAgain);

app.get("/audio/:sure/:ayet", async (req, res) => {
    try {
        const remoteUrl = `https://kurancilar.github.io/audio/${req.params.sure}/${req.params.ayet}.mp3`;
        
        const response = await fetch(remoteUrl);

        if (!response.ok) {
            return res.status(500).send('Uzak dosya alınamadı');
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