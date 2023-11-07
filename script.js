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

canvas.width = document.querySelector('.container').clientWidth;
canvas.height = window.innerHeight * 0.8;

const waveformHistory = [];

// ... (setup and event listeners from previous snippets)

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radius = 2; // Radius of the dots
    ctx.fillStyle = '#DE3730';
    dataArray.forEach((value, i) => {
        const percent = value / 255;
        const y = (canvas.height / 2) + (canvas.height / 2) * percent - radius;
        const x = (i / bufferLength) * canvas.width;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, canvas.height - y, radius, 0, Math.PI * 2); // Reflection
        ctx.fill();
    });
}
draw();
