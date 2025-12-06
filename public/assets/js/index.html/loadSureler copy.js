const sureNames = [
    "Fatiha",
    "Bakara",
    "Al-i İmran",
    "Nisa",
    "Maide",
    "En'am",
    "A'raf",
    "Enfal",
    "Tevbe",
    "Yunus",
    "Hud",
    "Yusuf",
    "Rad",
    "İbrahim",
    "Hicr",
    "Nahl",
    "İsra",
    "Kehf",
    "Meryem",
    "Taha",
    "Enbiya",
    "Hac",
    "Müminun",
    "Nur",
    "Furkan",
    "Şuara",
    "Neml",
    "Kasas",
    "Ankebut",
    "Rum",
    "Lukman",
    "Secde",
    "Ahzab",
    "Sebe",
    "Fatır",
    "Yasin",
    "Saffat",
    "Sad",
    "Zümer",
    "Mümin",
    "Fussilet",
    "Şura",
    "Zuhruf",
    "Duhan",
    "Casiye",
    "Ahkaf",
    "Muhammed",
    "Fetih",
    "Hucurat",
    "Kaf",
    "Zariyat",
    "Tur",
    "Necm",
    "Kamer",
    "Rahman",
    "Vakıa",
    "Hadid",
    "Mücadele",
    "Haşr",
    "Mümtehine",
    "Saf",
    "Cuma",
    "Münafikun",
    "Tegabun",
    "Talak",
    "Tahrim",
    "Mülk",
    "Kalem",
    "Hakka",
    "Mearic",
    "Nuh",
    "Cin",
    "Müzzemmil",
    "Müddessir",
    "Kıyamet",
    "İnsan",
    "Mürselat",
    "Nebe",
    "Naziat",
    "Abese",
    "Tekvir",
    "İnfitar",
    "Mutaffifin",
    "İnşikak",
    "Büruc",
    "Tarık",
    "A'la",
    "Gaşiye",
    "Fecr",
    "Beled",
    "Leyl",
    "Duha",
    "İnşirah",
    "Tin",
    "Tarık",
    "Alak",
    "Kadir",
    "Beyyine",
    "Zilzal",
    "Adiyat",
    "Kari'a",
    "Tekasür",
    "Asr",
    "Hümeze",
    "Fil",
    "Kureyş",
    "Ma'un",
    "Kevser",
    "Kafirun",
    "Nasr",
    "Tebbet",
    "İhlas",
    "Felak",
    "Nas"
]

const mealDiv = document.querySelector("#meal");
const tefsirDiv = document.querySelector("#tefsir");

sureNames.forEach((name, i) => {
    const num = i + 1;
    const link = document.createElement("a");
    link.className = "sure-item";

    link.href = `kuran?sure=${num}`;
    link.innerHTML = `
        <span class="sure-number">${num}</span>
        <span class sure-name>${name}</span>
    `;

    link.onclick = function() {
        localStorage.setItem("lastChapter", num);
    }

    mealDiv.appendChild(link);
})

sureNames.forEach((name, i) => {
    const num = i + 1;
    const link = document.createElement("a");
    link.className = "sure-item";

    link.href = `tefsir/${num}`;
    link.innerHTML = `
        <span class="sure-number">${num}</span>
        <span class sure-name>${name} Suresi Tefsiri</span>
    `;

    link.onclick = function() {
        localStorage.setItem("lastChapter", num);
    }

    tefsirDiv.appendChild(link);
})