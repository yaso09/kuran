const express = require("express");
const app = express();

app.use(express.static("www"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Uygulama ${PORT} portunda çalışıyor\n http://localhost:${PORT}/`);
});