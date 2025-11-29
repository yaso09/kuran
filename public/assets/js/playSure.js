async function playSure() {
    const audios = Array.from(document.querySelectorAll('audio'))
        .sort((a, b) => Number(a.id) - Number(b.id));

    // Ses dosyalarını buffer olarak yükle
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffers = await Promise.all(audios.map(async audio => {
        const response = await fetch(audio.src);
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    }));

    let currentTime = audioContext.currentTime;

    buffers.forEach((buffer, index) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        // Scroll işlemi
        const targetId = audios[index].dataset.scrollTo;
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.style.color = "blue";
                    let x = targetId.split(":");
                    x[1] = Number(x[1]) - 1;
                    document.getElementById(x.join(":")).style.color = "black";
                }, (currentTime - audioContext.currentTime) * 1000);
            }
        }

        source.start(currentTime);
        currentTime += buffer.duration;
    });
}
