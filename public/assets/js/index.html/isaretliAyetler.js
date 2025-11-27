if (
    JSON.parse(localStorage.getItem("markeds")) && localStorage.getItem("markeds") !== "[]"
) {
    JSON.parse(localStorage.getItem("markeds")).forEach(verseKey => {
        document.querySelector("#isaretliler").innerHTML += `
            <iframe onload="
                window.addEventListener('message', function(e) {
                    if (e.data.embedHeight && e.data.name == '${verseKey}') {
                        document.querySelector('#kuranEmbed${verseKey}').style.height = e.data.embedHeight + 'px';
                    }
                })
            " scrolling="no" style="
                width: 500px;
                border: 0;
                overflovx:hidden
            " id="kuranEmbed${verseKey}"
            allowtransparency="true"
            src="/embed.html?sure=${
                verseKey.split(":")[0]
            }&ayet=${
                verseKey.split(":")[1]
            }&meal=diyanet_vakfi"></iframe>
        `
    })
} else {
    document.querySelector("#isaretliAyetler").style.display = "none";

    document.querySelector("#isaretliler").style.display = "none";
}