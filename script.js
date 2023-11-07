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

canvas.width = document.querySelector('.container').clientWidth;
canvas.height = window.innerHeight * 0.8;

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Slight canvas fade effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let radius = 100;

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barLength = (value / 255) * (canvas.height / 2);
        const angle = (i / bufferLength) * Math.PI * 2;

        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + (radius + barLength) * Math.cos(angle);
        const y2 = centerY + (radius + barLength) * Math.sin(angle);

        ctx.strokeStyle = `hsl(${(value / 255.0) * 360}, 100%, 50%)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

playButton.addEventListener('click', function() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (audio.paused) {
        audio.play();
        playButton.textContent = 'Pause';
        draw();
    } else {
        audio.pause();
        playButton.textContent = 'Play';
    }
});

audio.addEventListener('timeupdate', function() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(1).padStart(4, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('ended', () => {
    playButton.textContent = 'Play';
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
