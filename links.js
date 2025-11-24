const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

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

module.exports = app;