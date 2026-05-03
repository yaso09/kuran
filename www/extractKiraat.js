/**
 * extractKiraat.js
 * Replicates the logic of extractKiraat.py in Javascript for Mobile (Cordova)
 */

const extractKiraat = {
    extract: async function (file, dataDirEntry, onProgress) {
        return new Promise(async (resolve, reject) => {
            const tempZipFile = "temp_kiraat.zip";
            const tempUnzipDirName = "temp_unzip_kiraat";
            
            try {
                if (typeof zip === 'undefined') {
                    return reject("Cordova Zip plugin bulunamadı. Lütfen eklentiyi kontrol edin.");
                }

                // 1. Yazılabilir alana geçici zip dosyasını yaz
                if (onProgress) onProgress(10);
                await this.writeRawFile(dataDirEntry, tempZipFile, file);
                
                const source = dataDirEntry.nativeURL + tempZipFile;
                const destination = dataDirEntry.nativeURL + tempUnzipDirName + "/";

                // 2. Geçici klasöre çıkart
                if (onProgress) onProgress(30);
                
                // Klasörün var olduğundan emin ol (bazı cihazlarda zip.unzip otomatik oluşturmaz)
                await this.getDirectory(dataDirEntry, tempUnzipDirName, true);

                zip.unzip(source, destination, async (status) => {
                    if (status === 0) {
                        try {
                            if (onProgress) onProgress(60);

                            // 3. recitation.json oku
                            const infoStr = await this.readTextFile(dataDirEntry, tempUnzipDirName + "/recitation.json");
                            const info = JSON.parse(infoStr);
                            const reciterName = info.reciter;
                            if (!reciterName) throw new Error("recitation.json içinde 'reciter' alanı bulunamadı.");

                            const reciterId = this.slugify(reciterName) || "custom_reciter";
                            
                            // 4. Hedef klasörü ayarla
                            const okumalarDir = await this.getDirectory(dataDirEntry, "okumalar", true);
                            
                            // Eğer bu okuyucu zaten varsa önce eskisini sil
                            try {
                                const existing = await this.getDirectory(okumalarDir, reciterId, false);
                                await new Promise((res) => existing.removeRecursively(res, res));
                            } catch(e) {}

                            // 5. temp_unzip_kiraat klasörünü okumalar/reciterId olarak taşı
                            const tempDirEntry = await this.getDirectory(dataDirEntry, tempUnzipDirName, false);
                            await new Promise((res, rej) => {
                                tempDirEntry.moveTo(okumalarDir, reciterId, res, rej);
                            });

                            if (onProgress) onProgress(90);

                            // 6. okumalar.json güncelle
                            await this.updateOkumalarJson(dataDirEntry, reciterId, reciterName);

                            // 7. Geçici zip dosyasını sil
                            await this.removeFile(dataDirEntry, tempZipFile);

                            if (onProgress) onProgress(100);
                            resolve({ status: "success", name: reciterName });
                        } catch (e) {
                            reject("Açma sonrası hata: " + e.message);
                        }
                    } else {
                        reject("Zip açma hatası: " + status);
                    }
                }, (progressEvent) => {
                    // İsteğe bağlı: zip.unzip progress takibi
                    if (onProgress && progressEvent.total > 0) {
                        const p = 30 + Math.round((progressEvent.loaded / progressEvent.total) * 30);
                        onProgress(p);
                    }
                });
            } catch (e) {
                reject("Genel hata: " + e.message);
            }
        });
    },

    getDirectory: function (parentEntry, name, create) {
        return new Promise((resolve, reject) => {
            parentEntry.getDirectory(name, { create: create }, resolve, reject);
        });
    },

    updateOkumalarJson: async function (dataDirEntry, id, name) {
        const path = "okumalar/okumalar.json";
        let data = { "gamadi": "Saad al-Ghamidi", "muaykli": "Mahir el-Muaykli" };
        try {
            const content = await this.readTextFile(dataDirEntry, path);
            data = JSON.parse(content);
        } catch (e) {
            // file might not exist yet
        }
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
                            // Opsiyonel: Burada çok detaylı log veya progress eklenebilir
                            writeNextChunk();
                        };
                        fileWriter.write(chunk);
                    };

                    fileWriter.onwriteend = () => {
                        // Truncate bitti, yazmaya başla
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