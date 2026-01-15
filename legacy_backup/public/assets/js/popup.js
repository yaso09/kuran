const popupArka = document.getElementById("popupArkaPlan");
const popupKapatBtn = document.getElementById("popupKapat");

async function dontShowAgain() {
    await fetch("/api/dontShowAgain")
        .then(dat => dat.text())
        .then(text => {
            if (text !== localStorage.getItem("dontShowAgainNumber")) {
                localStorage.setItem("dontShowAgain", false);
                localStorage.setItem("dontShowAgainNumber", text);
            }
        })
        .catch(err => {
            console.error(err);
            localStorage.setItem("dontShowAgain", false);
        })
}

dontShowAgain();


// Kapat butonu
popupKapatBtn.addEventListener("click", () => {
    popupArka.classList.remove("aktif");
    if (document.querySelector("#dontShowAgain").checked)
        localStorage.setItem("dontShowAgain", true);
});

document.querySelector("#git").addEventListener("click", function() {
    if (document.querySelector("#dontShowAgain").checked)
        localStorage.setItem("dontShowAgain", true);
})

// Arka plana tıklayınca kapansın
popupArka.addEventListener("click", (e) => {
    if (e.target === popupArka) {
        popupArka.classList.remove("aktif");
    }

});

// Sayfa yüklenince otomatik aç
document.addEventListener("DOMContentLoaded", () => {
    if (
        !localStorage.getItem("dontShowAgain")
        || localStorage.getItem("dontShowAgain") == "false"
    ) popupArka.classList.add("aktif");
});