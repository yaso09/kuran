/**
 * extractTefsir.js
 * Replicates the logic of extractTefsir.py in Javascript for Mobile (Cordova)
 */

const extractTefsir = {
    extract: async function (file, dataDirEntry, onProgress) {
        return new Promise(async (resolve, reject) => {
            const tempZipFile = "temp_tefsir.zip";
            const tempUnzipDirName = "temp_unzip_tefsir_root";
            
            try {
                if (typeof zip === 'undefined') {
                    return reject("Cordova Zip plugin bulunamadı.");
                }

                // 1. Yazılabilir alana geçici zip dosyasını yaz
                if (onProgress) onProgress(10);
                await this.writeRawFile(dataDirEntry, tempZipFile, file);
                
                const source = dataDirEntry.nativeURL + tempZipFile;
                const destination = dataDirEntry.nativeURL + tempUnzipDirName + "/";

                // 2. Geçici klasöre çıkart
                if (onProgress) onProgress(30);
                await this.getDirectory(dataDirEntry, tempUnzipDirName, true);

                zip.unzip(source, destination, async (status) => {
                    if (status === 0) {
                        try {
                            if (onProgress) onProgress(60);

                            // 3. tefsir.json oku
                            const infoStr = await this.readTextFile(dataDirEntry, tempUnzipDirName + "/tefsir.json");
                            const info = JSON.parse(infoStr);
                            const tefsirName = info.name;
                            if (!tefsirName) throw new Error("tefsir.json içinde 'name' alanı bulunamadı.");

                            const tefsirId = this.slugify(tefsirName) || "custom_tefsir";

                            // 4. Hedef klasörü ayarla
                            const tefsirlerDir = await this.getDirectory(dataDirEntry, "tefsirler", true);
                            
                            // Eğer bu tefsir zaten varsa sil
                            try {
                                const existing = await this.getDirectory(tefsirlerDir, tefsirId, false);
                                await new Promise((res) => existing.removeRecursively(res, res));
                            } catch(e) {}

                            // 5. Taşı
                            const tempDirEntry = await this.getDirectory(dataDirEntry, tempUnzipDirName, false);
                            await new Promise((res, rej) => {
                                tempDirEntry.moveTo(tefsirlerDir, tefsirId, res, rej);
                            });

                            if (onProgress) onProgress(90);

                            // 6. Güncelle
                            await this.updateTefsirlerJson(dataDirEntry, tefsirId, tefsirName);

                            // 7. Temizlik
                            await this.removeFile(dataDirEntry, tempZipFile);

                            if (onProgress) onProgress(100);
                            resolve({ status: "success", name: tefsirName });
                        } catch (e) {
                            reject("Tefsir açma sonrası hata: " + e.message);
                        }
                    } else {
                        reject("Tefsir zip açma hatası: " + status);
                    }
                });
            } catch (e) {
                reject("Genel tefsir hatası: " + e.message);
            }
        });
    },

    getDirectory: function (parentEntry, name, create) {
        return new Promise((resolve, reject) => {
            parentEntry.getDirectory(name, { create: create }, resolve, reject);
        });
    },

    updateTefsirlerJson: async function (dataDirEntry, id, name) {
        const path = "tefsirler/tefsirler.json";
        let data = {};
        try {
            const content = await this.readTextFile(dataDirEntry, path);
            data = JSON.parse(content);
        } catch (e) { }
        data[id] = name;
        await this.writeRawFile(dataDirEntry, path, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    },

    slugify: function (text) {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '_')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    writeRawFile: function (dirEntry, path, blob) {
        return new Promise((resolve, reject) => {
            const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
            let offset = 0;

            dirEntry.getFile(path, { create: true }, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    fileWriter.onerror = (e) => reject("Yazma hatası: " + JSON.stringify(e));
                    
                    const writeNextChunk = () => {
                        if (offset >= blob.size) {
                            resolve();
                            return;
                        }
                        const chunk = blob.slice(offset, offset + CHUNK_SIZE);
                        fileWriter.onwriteend = () => {
                            offset += CHUNK_SIZE;
                            writeNextChunk();
                        };
                        fileWriter.write(chunk);
                    };

                    fileWriter.onwriteend = () => {
                        writeNextChunk();
                    };
                    
                    fileWriter.truncate(0);
                }, (err) => reject("Writer hatası: " + JSON.stringify(err)));
            }, (err) => reject("Dosya hatası: " + JSON.stringify(err)));
        });
    },

    readTextFile: function (dirEntry, path) {
        return new Promise((resolve, reject) => {
            dirEntry.getFile(path, {}, (fileEntry) => {
                fileEntry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                }, reject);
            }, reject);
        });
    },

    removeFile: function (dirEntry, path) {
        return new Promise((resolve) => {
            dirEntry.getFile(path, {}, (fileEntry) => {
                fileEntry.remove(resolve, resolve);
            }, resolve);
        });
    },

    removeRecursively: function (dirEntry, path) {
        return new Promise((resolve) => {
            dirEntry.getDirectory(path, {}, (dirEntry) => {
                dirEntry.removeRecursively(resolve, resolve);
            }, resolve);
        });
    }
};