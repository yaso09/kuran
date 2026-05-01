const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const src = path.join(__dirname, "www");
const dst = path.join(__dirname, "mobile", "www");

// 1. KOPYALA
async function copyFiles() {
    await fs.copy(src, dst, {
        overwrite: true
    });
    console.log("Kopyalama tamamlandı.");
}

// 2. BUILD
function buildCordova() {
    return new Promise((resolve, reject) => {
        exec("npx cordova run android", { cwd: path.join(__dirname, "mobile") }, (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
                return reject(err);
            }
            console.log(stdout);
            console.log("Uygulama çalıştırıldı.");
            resolve();
        });
    });
}

// 3. TEMİZLE (README.md hariç)
async function clean() {
    const items = await fs.readdir(dst);

    for (const item of items) {
        if (item === "README.md") continue;

        const targetPath = path.join(dst, item);
        await fs.remove(targetPath);
    }

    console.log("Temizleme tamamlandı.");
}

// MAIN FLOW
(async () => {
    try {
        await copyFiles();
        await buildCordova();
        await clean();
        console.log("Tüm işlem tamamlandı.");
    } catch (err) {
        console.error("Hata oluştu:", err);
    }
})();