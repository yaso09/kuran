let isPlaying = false; // global scope'ta
let stopFlag = false;

async function playSure() {
    document.querySelector("#start").style.display = "none";
    document.querySelector("#stop").style.display = "inline";

    if (isPlaying) return; // zaten çalıyorsa yeni çağrıyı durdur
    isPlaying = true;

    const audios = Array.from(document.querySelectorAll('audio'))
        .sort((a, b) => Number(a.id) - Number(b.id));

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffers = await Promise.all(audios.map(async audio => {
        const response = await fetch(audio.src);
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    }));

    let prevTargetId = null;

    for (let i = 0; i < buffers.length; i++) {
        const targetId = audios[i].dataset.scrollTo;

        if (stopFlag) {
            let x = targetId.split(":");
            if (Number(x[1]) !== 1) {
                x[1] = Number(x[1]) - 1;
                document.getElementById(x.join(":")).style.color = "black";
            }
            stopFlag = false;
            break;
        }

        const buffer = buffers[i];
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.style.color = "blue";
                let x = targetId.split(":");
                if (Number(x[1]) !== 1) {
                    x[1] = Number(x[1]) - 1;
                    document.getElementById(x.join(":")).style.color = "black";
                }
            }
        }

        await new Promise(resolve => {
            source.onended = resolve;
            source.start();
        });
    }

    isPlaying = false; // bitince tekrar çalabilir
    document.querySelector("#start").style.display = "inline";
    document.querySelector("#stop").style.display = "none";
}

function stopSure() {
    document.querySelector("#start").style.display = "inline";
    document.querySelector("#stop").style.display = "none";
    stopFlag = true;
}