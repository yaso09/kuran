function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const sureSelect = document.getElementById('sureSelect');

let selectedSure = sureSelect.value;

if (getQueryParam("sure")) {
    selectedSure = getQueryParam("sure");
    sureSelect.value = selectedSure;
} else {
    selectedSure = localStorage.getItem("lastChapter");
}

function scrollToAyet(num = getQueryParam("ayet")) {
    document.getElementById(`verse${selectedSure}:${num}`).scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
}

sureSelect.addEventListener("change", function() {
    const url = new URL(window.location.href);
    url.searchParams.set("sure", sureSelect.value);

    window.history.replaceState({}, "", url);

    window.location.reload();

})

const searchInput = document.getElementById('searchInput');
const mealSelect = document.getElementById("mealSelect");
let allVerses = [];

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

for(let i=1;i<=114;i++){
    const option=document.createElement('option');
    option.value=i;
    option.textContent=`${i}. ${sureNames[i-1] || 'Sure '+i}`;
    sureSelect.appendChild(option);
}

const prevSureBtn = document.getElementById('prevSure');
const nextSureBtn = document.getElementById('nextSure');
const navigationDiv = document.getElementById('navigationButtons');

function updateNavigationButtons(chapter){
    if(!chapter) { navigationDiv.style.display='none'; return; }
    navigationDiv.style.display='block';
    prevSureBtn.disabled = (chapter <= 1);
    nextSureBtn.disabled = (chapter >= 114);
}

prevSureBtn.addEventListener('click',()=>{
    let chap = parseInt(selectedSure);
    if(chap > 1){ chap--; selectedSure = chap; renderVersesFromAPI(chap, mealSelect.value); localStorage.setItem('lastChapter', chap); }
});

nextSureBtn.addEventListener('click',()=>{
    let chap = parseInt(selectedSure);
    if(chap < 114){ chap++; selectedSure = chap; renderVersesFromAPI(chap, mealSelect.value); localStorage.setItem('lastChapter', chap); }
});

function mark(verseKey) {
    if (!localStorage.getItem("markeds"))
        localStorage.setItem("markeds", "[]");
    if (localStorage.getItem("markeds").search(verseKey) > 0) {
        localStorage.setItem("markeds",
            JSON.stringify(
                JSON.parse(localStorage.getItem("markeds")).filter(
                    n => n !== verseKey
                )
            )
        )
    } else {
        let markeds = JSON.parse(localStorage.getItem("markeds"));
        markeds.push(verseKey);
        localStorage.setItem("markeds", JSON.stringify(markeds));
    }
}

function isMarked(verseKey) {
    if (localStorage.getItem("markeds"))
        return JSON.parse(localStorage.getItem("markeds")).indexOf(verseKey) >= 0;
    else {
        localStorage.setItem("markeds", "[]");
        return false;
    };
}

function highlightText(text, query){
    if(!query) return text;
    const escaped=query.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
    const regex=new RegExp(escaped,'gi');
    return text.replace(regex,match=>`<mark>${match}</mark>`);
}

async function renderVersesFromAPI(sureNo, highlight='', mealName) {
    localStorage.setItem("lastChapter", sureNo);

    if (!mealName) mealName = "diyanet_vakfi";
    const container = document.getElementById('ayetler');
    container.innerHTML = "";
    document.querySelector("#loading").style.display = "block";
    document.querySelector("#navigationButtons").style.display = "none";
    sureSelect.value = selectedSure;

    function randomColor() {
        const colors = ['#ff6b6b', '#fbc531', '#4cd137', '#00a8ff', '#9c88ff', '#ff9ff3', '#ff4757', '#ff793f', '#3742fa'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // --- API'den veriyi çek ---
    const apiRes = await fetch(`/api/sure/${sureNo}`);
    const apiData = await apiRes.json();

    const verses = apiData.verses;

    for (let i = 0; i < verses.length; i++) {

        const ayet = verses[i];

        const verseDiv = document.createElement('div');
        verseDiv.classList.add('verse');

        const number = document.createElement('div');
        number.classList.add('verse-number');
        number.textContent = `Ayet ${ayet.verseNumber}`;

        const arabic = document.createElement('div');
        arabic.classList.add('arabic-text');
        arabic.innerHTML = highlightText(ayet.arabic, highlight);

        const tevil = document.createElement('div');
        tevil.classList.add('english-text');

        // API'deki meal: ayet.turkish[mealName]
        const mealText = ayet.turkish?.[mealName] || "Meâl bulunamadı.";
        tevil.innerHTML = highlightText(mealText, highlight);

        // ---------------------------
        // İşaretleme butonu
        // ---------------------------
        const markBtn = document.createElement("button");
        markBtn.classList.add("btn");
        markBtn.style.fontSize = "16px";
        markBtn.style.padding = "6px 12px";
        markBtn.style.marginTop = "5px";

        const key = ayet.verseKey; // 1:1 gibi

        if (isMarked(key)) {
            verseDiv.style.backgroundColor = "#ffe9c9";
            verseDiv.style.borderRadius = "14px";
            verseDiv.style.border = "10px #ffe9c9 solid";
            markBtn.textContent = "🤩 İşaretlemeyi Kaldır";
        }
        else {
            markBtn.textContent = "⭐ İşaretle";
        }

        markBtn.addEventListener("click", function () {
            if (isMarked(key)) {
                markBtn.textContent = "⭐ İşaretle";
                verseDiv.style.backgroundColor = "#fff";
                verseDiv.style.border = "0";
            } else {
                markBtn.textContent = "🤩 İşaretlemeyi Kaldır";
                verseDiv.style.backgroundColor = "#ffe9c9";
                verseDiv.style.borderRadius = "14px";
                verseDiv.style.border = "10px #ffe9c9 solid";
            }
            mark(key);
        });

        // ---------------------------
        // Paylaş butonu (mevcut kodun aynısı)
        // ---------------------------
        const shareBtn = document.createElement('button');
        shareBtn.textContent = '📤 Paylaş';
        shareBtn.classList.add('btn');
        shareBtn.style.fontSize = '16px';
        shareBtn.style.padding = '6px 12px';
        shareBtn.style.marginTop = '5px';

        shareBtn.addEventListener('click', async () => {
            const width = 1080;
            const height = 1080;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, randomColor());
            gradient.addColorStop(0.5, randomColor());
            gradient.addColorStop(1, randomColor());
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < 4; i++) {
                const radius = Math.random() * 400 + 200;
                const x = Math.random() * width;
                const y = Math.random() * height;
                const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
                glow.addColorStop(0, 'rgba(255,255,255,0.08)');
                glow.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, width, height);
            }

            for (let i = 0; i < 150; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
                const x = Math.random() * width;
                const y = Math.random() * height;
                const r = Math.random() * 3 + 1;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';

            ctx.font = 'bold 80px Kitab, serif';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;

            const arabicLines = ayet.arabic.split(/\n/);
            const arabicLineHeight = 90;
            let arabicHeight = arabicLines.length * arabicLineHeight;
            let y = (height - arabicHeight) / 2 - 50;

            arabicLines.forEach(line => {
                ctx.fillText(line, width / 2, y);
                y += arabicLineHeight;
            });

            ctx.shadowColor = 'transparent';
            ctx.font = '36px Arial, sans-serif';

            const englishText = mealText + ` [${key}]`;
            const words = englishText.split(' ');
            const maxWidth = width - 100;
            const lineHeight = 44;
            let line = '';
            let englishLines = [];

            words.forEach((word, idx) => {
                const testLine = line + (line ? ' ' : '') + word;
                if (ctx.measureText(testLine).width > maxWidth) {
                    englishLines.push(line);
                    line = word;
                } else line = testLine;
                if (idx === words.length - 1) englishLines.push(line);
            });

            y += 20;
            englishLines.forEach(el => {
                ctx.fillText(el, width / 2, y);
                y += lineHeight;
            });

            ctx.font = '24px Arial, sans-serif';
            ctx.fillText('kuran.yasireymen.com', width / 2, height - 40);

            canvas.toBlob(blob => {
                const filesArray = [new File([blob], 'ayet.png', { type: 'image/png' })];
                if (navigator.canShare && navigator.canShare({ files: filesArray })) {
                    navigator.share({
                        files: filesArray,
                        title: 'Ayet Paylaşımı',
                        text: mealText
                    }).catch(err => console.error('Paylaşım hatası:', err));
                } else {
                    alert('Bu cihaz resim paylaşımını desteklemiyor.');
                }
            });
        });

        // ---------------------------
        // Embed butonu
        // ---------------------------
        const embedBtn = document.createElement("button");
        embedBtn.textContent = "🔗 Göm";
        embedBtn.classList.add("btn");
        embedBtn.style.fontSize = "16px";
        embedBtn.style.padding = "6px 12px";
        embedBtn.style.marginTop = "5px";

        embedBtn.addEventListener("click", function () {
            const embedCode = `
                <iframe onload="
                    window.addEventListener('message', function(e) {
                        if (e.data.embedHeight && e.data.name == '${key}') {
                            document.getElementById('kuranEmbed${key}').style.height = 
                                e.data.embedHeight + 'px';
                        }
                    })
                " scrolling="no" width="100%" frameborder="0"
                id="kuranEmbed${key}"
                src="https://kuran.yasireymen.com/embed?sure=${sureNo}&ayet=${ayet.id}&meal=${mealName}"></iframe>
            `;

            navigator.clipboard.writeText(embedCode).then(() => {
                embedBtn.textContent = "👍 Kopyalandı";
                setTimeout(() => embedBtn.textContent = "🔗 Göm", 3000);
            });
        });

        // ---------------------------
        // Yeni sekmede açma
        // ---------------------------
        const openNewTabBtn = document.createElement('button');
        openNewTabBtn.textContent = '🖥 Yeni Sekmede Aç';
        openNewTabBtn.classList.add('btn');
        openNewTabBtn.style.fontSize = '16px';
        openNewTabBtn.style.padding = '6px 12px';
        openNewTabBtn.style.marginTop = '5px';

        openNewTabBtn.addEventListener('click', () => {
            const url = `/embed?sure=${sureNo}&ayet=${ayet.id}&meal=${mealName}`;
            window.open(url, '_blank');
        });

        // ---------------------------

        verseDiv.appendChild(number);
        verseDiv.appendChild(arabic);
        verseDiv.appendChild(tevil);
        verseDiv.appendChild(markBtn);
        verseDiv.appendChild(shareBtn);
        verseDiv.appendChild(embedBtn);
        verseDiv.appendChild(openNewTabBtn);

        verseDiv.id = `verse${key}`;

        container.appendChild(verseDiv);

    }

    document.querySelector("#loading").style.display = "none";
    document.querySelector("#navigationButtons").style.display = "block";

    const scrollTop = localStorage.getItem(`${selectedSure}.scrollTop`);
    if (getQueryParam("ayet")) {
        scrollToAyet();
    } else if(scrollTop) window.scrollTo({
        top: parseInt(scrollTop),
        behavior: "smooth"
    });

    sureSelect.value = selectedSure;

    updateNavigationButtons(parseInt(selectedSure));
}

window.addEventListener("beforeunload", function() {
    localStorage.setItem(`${selectedSure}.scrollTop`, window.scrollY)
})

mealSelect.addEventListener("change",(e)=> {
    renderVersesFromAPI(selectedSure, "", e.target.value);
})

renderVersesFromAPI(selectedSure);

function updateStreak() {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastDate");
    let streak = parseInt(localStorage.getItem("streak") || "0", 10);

    if (!lastDate) {
        // İlk gün
        streak = 1;
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastDate", today);
        return;
    }

    const diffDays = (new Date(today) - new Date(lastDate)) / 86400000;

    if (diffDays === 1) {
        streak++;
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastDate", today);
    } else if (diffDays > 1) {
        // Gün atlandıysa istersen sıfırlamak yerine yine 1'den başlatabilirsin
        streak = 1;
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastDate", today);
    }
}

updateStreak();