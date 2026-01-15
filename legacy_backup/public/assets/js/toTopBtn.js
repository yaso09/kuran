const toTopBtn = document.querySelector("#toTopBtn");

toTopBtn.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
})

window.addEventListener("scroll", function() {
    if (window.scrollY > 250) {
        toTopBtn.classList.add("show");
    } else {
        toTopBtn.classList.remove("show");
    }
})