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
    cmp(a, b=this.todayYMD) {
        const da = new Date(a);
        const db = new Date(b);

        return da - db;
    }
    constructor() {
        if (!localStorage.getItem("streak")) {
            document.querySelector("#continue").style.display = "none";
            document.querySelector("#continueFreeze").style.display = "none";
        }
        else {
            if (this.cmp(
                this.todayYMD(),
                localStorage.getItem("lastDate")
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