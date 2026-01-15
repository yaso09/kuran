let isMobile = window.matchMedia("(max-width: 700px)").matches;
const panelList = document.querySelectorAll(".tilt-wrap");

if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
        document.getElementById("sureSearch").style.marginBottom = "7rem";
        document.getElementById("fihristHeader").style.marginTop = "7rem";
        panelList.forEach(box => {
            const rect = box.getBoundingClientRect();

            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (!inside) {
                box.classList.remove("tilt-active");
                document.getElementById("sureSearch").style.marginBottom = null;
                document.getElementById("fihristHeader").style.marginTop = null;
                box.style.transform = "none";
                return;
            }

            const x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;

            const rotateX = y * 2.5;
            const rotateY = -x * 2.5;

            box.classList.add("tilt-active");

            box.style.transform =
                `perspective(1000px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 scale(1.015)`;
        });
    });

    document.addEventListener("mouseleave", () => {
        panelList.forEach(box => {
            box.classList.remove("tilt-active");
            box.style.transform = "none";
        });
    });
}
