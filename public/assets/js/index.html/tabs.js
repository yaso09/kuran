const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // tüm butonlardaki active'i kaldır
        tabButtons.forEach(b => b.classList.remove('active'));

        // tüm içeriklerden active'i kaldır
        tabContents.forEach(c => c.classList.remove('active'));

        // seçilen sekmeyi aktif yap
        btn.classList.add('active');
        document.getElementById(tab).classList.add('active');
    });
});
