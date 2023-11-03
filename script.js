const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const timeCounter = document.getElementById('timeCounter');

let started = false;

canvas.width = document.querySelector('.container').clientWidth - 32;
canvas.height = window.innerHeight * 0.8;

const history = [];
const barWidth = 6;
const barSpacing = 8;
const totalBarSpace = barWidth + barSpacing;

function draw(analyser) {
    requestAnimationFrame(() => draw(analyser));

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    history.push(averageVolume);

    if (history.length > (canvas.width * 0.65) / totalBarSpace) {
        if (history.length % 2 === 0) history.shift();
    }

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FD8775';

    for (let h = 0; h < history.length; h++) {
        const x = h * totalBarSpace;
        const height = (history[h] / 256) * canvas.height;
        const halfHeight = height / 2;
        const y = canvas.height / 2;

        const path = new Path2D();
        path.moveTo(x, y - halfHeight);
        path.lineTo(x + barWidth, y - halfHeight);
        path.arcTo(x + barWidth, y, x, y, barWidth / 2);
        path.lineTo(x, y + halfHeight);
        path.arcTo(x, y, x + barWidth, y, barWidth / 2);
        ctx.fill(path);
    }
}

playButton.addEventListener('click', function() {
    if (!started) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;

        audioContext.resume().then(() => {
            audio.play();
            draw(analyser);
            started = true;
        });
    } else {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
});

audio.addEventListener('timeupdate', function() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
