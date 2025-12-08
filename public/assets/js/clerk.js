function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

async function loadClerk() {
    await Clerk.load();

    if (Clerk.isSignedIn)
        document.getElementById("sign-in").style.display = "none";
    if (!Clerk.isSignedIn) {
        document.getElementById("profile").style.display = "none";
    }

    const cont = new Continue();

    loadScript("/assets/js/index.html/isaretliAyetler.js")
}