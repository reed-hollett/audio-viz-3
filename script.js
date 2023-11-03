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

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FD8775'; // Waveform color

    for (let h = 0; h < history.length; h++) {
        const x = h;
        const height = (history[h] / 256) * canvas.height;
        const y = canvas.height / 2 - height / 2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
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
    const seconds = (currentTime % 60).toFixed(1).padStart(4, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
