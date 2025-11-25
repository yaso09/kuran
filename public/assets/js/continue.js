/*if (!localStorage.getItem("streak")) {
    document.querySelector("#devamEt").style.display = "none";
} else {
    if (Date.now())
    document.querySelector("#streakCounter").innerText =
        `${localStorage.getItem("streak")} Günlük Serin Var`
}*/

class Continue {
    todayYMD() {
        const now = new Date();

        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");

        return `${y}-${m}-${d}`;
    }
    daysBetween(a, b) {
    const re = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

    const parse = (s) => {
        const m = s.match(re);
        if (!m) throw new Error(`Geçersiz format: "${s}". Beklenen: YYYY-MM-DD`);
        const year = Number(m[1]);
        const month = Number(m[2]); // 1-12
        const day = Number(m[3]);   // 1-31

        // basit geçerlilik kontrolleri
        if (month < 1 || month > 12) throw new Error(`Geçersiz ay: ${month}`);
        if (day < 1 || day > 31) throw new Error(`Geçersiz gün: ${day}`);

        // UTC midnight üret (zaman dilimi problemi olmasın diye)
        return Date.UTC(year, month - 1, day);
    };

    const msA = parse(a);
    const msB = parse(b);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const diffMs = Math.abs(msA - msB);
    return Math.floor(diffMs / MS_PER_DAY);
    }
    constructor() {
        if (!localStorage.getItem("streak")) {
            document.querySelector("#continue").style.display = "none";
            document.querySelector("#continueFreeze").style.display = "none";
        }
        else {
            if (this.daysBetween(
                localStorage.getItem("lastDate"),
                this.todayYMD()
            ) > 1) {
                document.querySelector("#continue").style.display = "none";
                document.querySelector("#streakCounterFreeze").innerText = 
                    `${localStorage.getItem("streak")} Günlük Serin Vardı`;
            }
            else {
                document.querySelector("#continueFreeze").style.display = "none";
                document.querySelector("#streakCounter").innerHTML =
                    `${localStorage.getItem("streak")} Günlük Serin Var`;
            }
        }
    }
}

const cont = new Continue();