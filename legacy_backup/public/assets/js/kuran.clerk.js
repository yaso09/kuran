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
    return await fetch(`/user/set`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key: key,
            value: value
        })
    });
}

async function getItem(key) { 
    return await fetch("/user/get")
        .then(dat => dat.json())
        .then(json => {
            localStorage.setItem(key, JSON.stringify(json[key]));
            return json[key];
        })
}

async function loadClerk() {
    await Clerk.load();

    loadScript("/assets/js/kuran.html.js");
}