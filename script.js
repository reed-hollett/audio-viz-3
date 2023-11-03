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

canvas.width = document.querySelector('.container').clientWidth - 32;
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

    const barWidth = 3;
    const barSpacing = 5;

    for (let h = 0; h < history.length; h++) {
        const x = h * (barWidth + barSpacing);
        const height = (history[h] / 256) * canvas.height;
        const halfHeight = height / 2;
        const y = canvas.height / 2;

        ctx.fillStyle = '#FD8775';
        ctx.fillRect(x, y - halfHeight, barWidth, halfHeight);
        ctx.fillRect(x, y, barWidth, halfHeight);
    }
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
