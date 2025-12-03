const sureSearchInput = document.getElementById("sureSearch");

// Meal ve Tefsir listesini renderlayan fonksiyon
function renderSureler(filter = "") {
    // Önce divleri temizle
    mealDiv.innerHTML = "";
    tefsirDiv.innerHTML = "";

    sureNames.forEach((name, i) => {
        const num = i + 1;

        // Filtreleme (harf duyarsız)
        if (!name.toLowerCase().includes(filter.toLowerCase())) return;

        // Meal link
        const mealLink = document.createElement("a");
        mealLink.className = "sure-item";
        mealLink.href = `kuran?sure=${num}`;
        mealLink.innerHTML = `
            <span class="sure-number">${num}</span>
            <span class sure-name>${name}</span>
        `;
        mealLink.onclick = () => localStorage.setItem("lastChapter", num);
        mealDiv.appendChild(mealLink);

        // Tefsir link
        const tefsirLink = document.createElement("a");
        tefsirLink.className = "sure-item";
        tefsirLink.href = `tefsir/${num}`;
        tefsirLink.innerHTML = `
            <span class="sure-number">${num}</span>
            <span class sure-name>${name} Suresi Tefsiri</span>
        `;
        tefsirLink.onclick = () => localStorage.setItem("lastChapter", num);
        tefsirDiv.appendChild(tefsirLink);
    });
}

// Başlangıçta tüm sureleri renderla
renderSureler();

// Arama inputu değiştikçe tekrar renderla
sureSearchInput.addEventListener("input", (e) => {
    renderSureler(e.target.value);
});