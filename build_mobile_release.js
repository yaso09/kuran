const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");

const src = path.join(__dirname, "www");
const dst = path.join(__dirname, "mobile", "www");

// 1. KOPYALA
async function copyFiles() {
    await fs.copy(src, dst, { overwrite: true });
    console.log("Kopyalama tamamlandı.");
}

// 2. RELEASE BUILD (APK)
function buildRelease() {
    return new Promise((resolve, reject) => {
        const proc = spawn(
            "npx",
            ["cordova", "build", "android", "--release"],
            {
                cwd: path.join(__dirname, "mobile"),
                shell: true
            }
        );

        proc.stdout.on("data", (data) => {
            process.stdout.write(data.toString());
        });

        proc.stderr.on("data", (data) => {
            process.stderr.write(data.toString());
        });

        proc.on("close", (code) => {
            if (code === 0) {
                console.log("\nRelease build başarılı.");
                resolve();
            } else {
                reject(new Error(`Build failed with code ${code}`));
            }
        });
    });
}

// 3. TEMİZLE
async function clean() {
    const items = await fs.readdir(dst);

    for (const item of items) {
        if (item === "README.md") continue;

        await fs.remove(path.join(dst, item));
    }

    console.log("Temizleme tamamlandı.");
}

// MAIN FLOW
(async () => {
    try {
        await copyFiles();
        await buildRelease();
        await clean();
        console.log("Tüm işlem tamamlandı.");
    } catch (err) {
        console.error("Hata:", err);
    }
})();