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

async function setItem(key, value) {
    return await fetch(`/user/set/${key}/${value}`);
}

async function getItem(key) { 
    if (Clerk) {
        return await Clerk.user.publicMetadata[key];
    }
}

async function loadClerk() {
    await Clerk.load();

    loadScript("/assets/js/kuran.html.js");
}