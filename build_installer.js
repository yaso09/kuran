const innosetupCompiler = require("innosetup-compiler");
const path = require("path");

console.log("Kurulum sihirbazı oluşturuluyor...");

innosetupCompiler(path.join(__dirname, "setup.iss"), {
    gui: false,
    verbose: true
}, function(error) {
    if (error) {
        console.error("Kurulum sihirbazı oluşturulurken hata:", error);
        process.exit(1);
    } else {
        console.log("Kurulum sihirbazı başarıyla oluşturuldu! dist/Kuran_Kurulum.exe");
    }
});
