const installButton = document.querySelector("#install-app");
let beforeInstallPromptEvent;
window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    beforeInstallPromptEvent = e;
    installButton.style.display = "block";
    installButton.addEventListener("click", function() {
        e.prompt();
    })
    installButton.hidden = false;
})

installButton.addEventListener("click", function() {
    beforeInstallPromptEvent.prompt();
    installButton.style.display = "none";
})