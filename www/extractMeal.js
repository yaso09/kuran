/**
 * extractMeal.js
 * Replicates the logic of extractMeal.py in Javascript for Mobile (Cordova)
 */

const extractMeal = {
    extract: async function (file, dataDirEntry, onProgress) {
        try {
            // file.text() eski Android WebView'larında yoktur — FileReader kullan
            const text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            if (lines.length === 0) throw new Error("Dosya boş.");

            const headerParts = lines[0].split("|");
            if (headerParts.length < 2) throw new Error("Geçersiz başlık formatı (dil|Ad).");

            const lang = headerParts[0].trim();
            const mealDisplayName = headerParts[1].trim();
            const mealKey = this.slugify(mealDisplayName) || "custom_meal";

            const mealMap = {};
            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split("|");
                if (parts.length < 3) continue;
                const sure = parts[0].trim();
                const ayet = parts[1].trim();
                const verseText = parts.slice(2).join("|").trim();
                mealMap[`${sure}:${ayet}`] = verseText;
            }

            // Get sureler directory
            const surelerDir = await this.getDirectory(dataDirEntry, "sureler");
            const entries = await this.readEntries(surelerDir);
            const jsonFiles = entries.filter(e => e.isFile && e.name.endsWith('.json'));

            let processed = 0;
            const total = jsonFiles.length;

            for (const fileEntry of jsonFiles) {
                const content = await this.readFile(fileEntry);
                let data = JSON.parse(content);
                let modified = false;

                for (let verse of data) {
                    const key = `${verse.sure}:${verse.ayet}`;
                    const text = mealMap[key];
                    if (text) {
                        if (!verse.translations) verse.translations = {};
                        if (!verse.translations[lang]) verse.translations[lang] = {};

                        verse.translations[lang][mealKey] = {
                            name: mealDisplayName,
                            text: text
                        };
                        modified = true;
                    }
                }

                if (modified) {
                    await this.writeFile(fileEntry, JSON.stringify(data));
                }

                processed++;
                if (onProgress) onProgress(Math.round((processed / total) * 100));
            }

            return { status: "success", name: mealDisplayName };
        } catch (e) {
            console.error("extractMeal error:", e);
            throw e;
        }
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

    getDirectory: function (dirEntry, name) {
        return new Promise((resolve, reject) => {
            dirEntry.getDirectory(name, { create: true }, resolve, reject);
        });
    },

    readEntries: function (dirEntry) {
        return new Promise((resolve, reject) => {
            const reader = dirEntry.createReader();
            reader.readEntries(resolve, reject);
        });
    },

    readFile: function (fileEntry) {
        return new Promise((resolve, reject) => {
            fileEntry.file(file => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            }, reject);
        });
    },

    writeFile: function (fileEntry, content) {
        return new Promise((resolve, reject) => {
            fileEntry.createWriter(fileWriter => {
                fileWriter.onerror = reject;
                // Önce truncate, sonra yaz — aksi hâlde eski içerik kalıntısı JSON'u bozar
                fileWriter.onwriteend = () => {
                    fileWriter.onwriteend = resolve;
                    const blob = new Blob([content], { type: 'application/json' });
                    fileWriter.write(blob);
                };
                fileWriter.truncate(0);
            }, reject);
        });
    }
};