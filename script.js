const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const timeCounter = document.getElementById('timeCounter');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = document.querySelector('.container').clientWidth - 32; // Adjusted for padding
canvas.height = window.innerHeight * 0.8;

const history = [];

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    history.push(averageVolume);
    if (history.length > canvas.width * 0.65) history.shift();

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FD8775';

    ctx.beginPath();
    for (let h = 1; h < history.length; h++) {
        const x = h;
        const prevX = h - 1;
        const height = (history[h] / 256) * canvas.height;
        const prevHeight = (history[prevX] / 256) * canvas.height;

        const y = canvas.height / 2 - height / 2;
        const prevY = canvas.height / 2 - prevHeight / 2;

        const cp1x = prevX;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) / 2;
        const cp2y = prevY + (y - prevY) / 2;

        ctx.moveTo(prevX, prevY);
        ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y);
    }
    ctx.stroke();
}

playButton.addEventListener('click', function() {
    audioContext.resume().then(() => {
        audio.play();
        draw();
    });
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
