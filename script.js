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

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;

function drawGradientWave() {
    requestAnimationFrame(drawGradientWave);

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'burgundy');

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;

    ctx.beginPath();

    let sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function updateTime() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
}

playButton.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (audio.paused) {
        audio.play();
        drawGradientWave();
    } else {
        audio.pause();
    }

    playButton.textContent = audio.paused ? 'Play' : 'Pause';
});

audio.addEventListener('timeupdate', updateTime);

audio.addEventListener('ended', () => {
    playButton.textContent = 'Play';
});

audio.addEventListener('error', (e) => {
    console.error('Error with the audio file:', e);
});

// Resize the canvas to fill browser window dynamically
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    drawGradientWave();
});

// Start the visualizer with the gradient effect
drawGradientWave();
