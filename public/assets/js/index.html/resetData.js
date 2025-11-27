function resetData() {
    if (!confirm(
        "Emin misiniz?"
    )) return;

    localStorage.clear();
    alert("Veriler temizlendi!");
    window.location.reload();
}