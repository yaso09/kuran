/**
 * Mobile File Manager for Cordova
 * Implements the extraction and management logic for meals, recitations, and tafsirs on mobile devices.
 */

const MobileFileManager = {
    // Directories
    dataDir: null,

    init: function () {
        return new Promise((resolve, reject) => {
            if (!window.cordova) {
                console.log("Not in Cordova environment, skipping file system init.");
                return resolve();
            }

            // Runtime Permission Request for Android
            if (window.cordova.platformId === 'android' && cordova.plugins && cordova.plugins.permissions) {
                const permissions = cordova.plugins.permissions;

                // Android 13+ (API 33+): READ/WRITE_EXTERNAL_STORAGE çalışmıyor,
                // bunların yerine READ_MEDIA_* izinleri gerekiyor.
                const sdkVersion = parseInt(device?.version) || 0;
                const list = sdkVersion >= 33
                    ? [permissions.READ_MEDIA_IMAGES, permissions.READ_MEDIA_AUDIO, permissions.READ_MEDIA_VIDEO]
                    : [permissions.READ_EXTERNAL_STORAGE, permissions.WRITE_EXTERNAL_STORAGE];

                permissions.requestPermissions(list, (status) => {
                    if (!status.hasPermission) {
                        console.warn("Storage permission denied by user.");
                    }
                    this.requestFS(resolve, reject);
                }, () => {
                    console.error("Error requesting permissions.");
                    this.requestFS(resolve, reject);
                });
            } else {
                this.requestFS(resolve, reject);
            }
        });
    },

    requestFS: function (resolve, reject) {
        console.log("Requesting file system...");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
            this.dataDir = fs.root;
            console.log("Mobile file system initialized:", fs.root.nativeURL);
            this.ensureFolders().then(() => {
                console.log("Folders checked/created.");
                resolve();
            }).catch(e => {
                console.error("Folder creation error:", e);
                reject(e);
            });
        }, (err) => {
            console.error("File system request failed:", err);
            if (err.code === 1) {
                alert("Dosya sistemine erişim izni alınamadı.");
            } else {
                alert("Dosya sistemi başlatılamadı: Hata Kodu " + err.code);
            }
            reject(err);
        });
    },

    ensureFolders: async function () {
        await this.createDir("mealler");
        await this.createDir("tefsirler");
        await this.createDir("okumalar");
        await this.createDir("risaleinur");
        const surelerDir = await this.createDir("sureler");

        // Bootstrap gerekli mi? Sure dosyaları veya juz.json eksikse
        const entries = await this.readEntries(surelerDir);
        let needsBootstrap = entries.length < 114;
        if (!needsBootstrap) {
            try { await this.readFile('juz.json'); }
            catch (e) { needsBootstrap = true; }
        }

        if (needsBootstrap) {
            console.log("Bootstrapping data files...");
            await this.bootstrapSureler();
        }
    },

    bootstrapSureler: async function () {
        // 1. Sure dosyaları (1-114)
        for (let i = 1; i <= 114; i++) {
            try {
                const r = await fetch(`sureler/${i}.json`);
                if (!r.ok) continue;
                await this.writeFile(`sureler/${i}.json`, await r.text());
            } catch (e) { console.error(`Bootstrap sure ${i} hata:`, e); }
        }

        // 2. Kök dizin statik dosyalar
        for (const f of ['juz.json', 'number_of_verses_per_page.json', 'quran_index.json', 'quran_words.json', 'quran_verses.json']) {
            try {
                const r = await fetch(f);
                if (!r.ok) continue;
                await this.writeFile(f, await r.text());
            } catch (e) { console.error(`Bootstrap ${f} hata:`, e); }
        }

        // 3. Risale-i Nur index
        try {
            const r = await fetch('risaleinur/index.json');
            if (r.ok) await this.writeFile('risaleinur/index.json', await r.text());
        } catch (e) { console.error('Bootstrap risaleinur/index.json hata:', e); }

        // 4. okumalar/okumalar.json — www'den kopyala, yoksa varsayılan oluştur
        try {
            const r = await fetch('okumalar/okumalar.json');
            if (r.ok) {
                await this.writeFile('okumalar/okumalar.json', await r.text());
            } else {
                await this.writeFile('okumalar/okumalar.json',
                    JSON.stringify({ "gamadi": "Saad al-Ghamidi", "muaykli": "Mahir el-Muaykli" }, null, 2));
            }
        } catch (e) {
            await this.writeFile('okumalar/okumalar.json',
                JSON.stringify({ "gamadi": "Saad al-Ghamidi", "muaykli": "Mahir el-Muaykli" }, null, 2));
        }

        // 5. tefsirler/tefsirler.json — www'den kopyala, yoksa boş oluştur
        try {
            const r = await fetch('tefsirler/tefsirler.json');
            if (r.ok) {
                await this.writeFile('tefsirler/tefsirler.json', await r.text());
            } else {
                await this.writeFile('tefsirler/tefsirler.json', '{}');
            }
        } catch (e) {
            await this.writeFile('tefsirler/tefsirler.json', '{}');
        }
    },

    readEntries: function (dirEntry) {
        return new Promise((resolve, reject) => {
            const reader = dirEntry.createReader();
            reader.readEntries(resolve, reject);
        });
    },

    createDir: function (name) {
        return new Promise((resolve, reject) => {
            this.dataDir.getDirectory(name, { create: true }, resolve, reject);
        });
    },

    // --- MEAL LOGIC ---
    importMeal: async function (file, onProgress) {
        if (typeof extractMeal !== 'undefined') {
            return await extractMeal.extract(file, this.dataDir, onProgress);
        }
        throw new Error("extractMeal.js yüklenemedi.");
    },

    // --- KIRAAT LOGIC ---
    importKiraat: async function (file, onProgress) {
        if (typeof extractKiraat !== 'undefined') {
            return await extractKiraat.extract(file, this.dataDir, onProgress);
        }
        throw new Error("extractKiraat.js yüklenemedi.");
    },

    // --- TEFSIR LOGIC ---
    importTefsir: async function (file, onProgress) {
        if (typeof extractTefsir !== 'undefined') {
            return await extractTefsir.extract(file, this.dataDir, onProgress);
        }
        throw new Error("extractTefsir.js yüklenemedi.");
    },

    // --- UTILS ---
    slugify: function (text) {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
            .replace(/\s+/g, '_')           // replace spaces with _
            .replace(/[^\w\-]+/g, '')       // remove all non-word chars
            .replace(/\-\-+/g, '_')         // replace multiple - with single _
            .replace(/^-+/, '')             // trim - from start
            .replace(/-+$/, '');            // trim - from end
    },

    writeFile: function (path, content) {
        return new Promise((resolve, reject) => {
            this.dataDir.getFile(path, { create: true }, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    fileWriter.onerror = reject;
                    // Önce truncate, sonra yaz — aksi hâlde eski içerik kalıntısı JSON'u bozar
                    fileWriter.onwriteend = () => {
                        fileWriter.onwriteend = resolve;
                        const blob = (content instanceof Blob)
                            ? content
                            : new Blob([content], { type: 'application/json' });
                        fileWriter.write(blob);
                    };
                    fileWriter.truncate(0);
                }, reject);
            }, reject);
        });
    },

    readFile: function (path) {
        return new Promise((resolve, reject) => {
            this.dataDir.getFile(path, {}, (fileEntry) => {
                fileEntry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                }, reject);
            }, reject);
        });
    },

    listDir: function (path) {
        return new Promise((resolve, reject) => {
            this.dataDir.getDirectory(path, {}, (dirEntry) => {
                const reader = dirEntry.createReader();
                reader.readEntries(resolve, reject);
            }, reject);
        });
    },

    deleteFolder: function (path) {
        return new Promise((resolve, reject) => {
            this.dataDir.getDirectory(path, {}, (dirEntry) => {
                dirEntry.removeRecursively(resolve, reject);
            }, reject);
        });
    },

    deleteFile: function (path) {
        return new Promise((resolve, reject) => {
            this.dataDir.getFile(path, {}, (fileEntry) => {
                fileEntry.remove(resolve, reject);
            }, reject);
        });
    },

    uploadItem: async function (file, onProgress) {
        const name = file.name.toLowerCase();
        if (name.endsWith('.meal')) {
            return await this.importMeal(file, onProgress);
        } else if (name.endsWith('.kiraat')) {
            return await this.importKiraat(file, onProgress);
        } else if (name.endsWith('.tefsir')) {
            return await this.importTefsir(file, onProgress);
        } else {
            throw new Error("Desteklenmeyen dosya türü. Sadece .meal, .kiraat ve .tefsir dosyaları yüklenebilir.");
        }
    }
};