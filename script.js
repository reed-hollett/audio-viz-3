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

    ctx.beginPath();
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const y = (0.5 + value / 255) * canvas.height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += canvas.width / bufferLength;
    }
    ctx.strokeStyle = '#DE3730';
    ctx.stroke();
    ctx.save();
    ctx.scale(1, -1); // Flip to create a reflection
    ctx.translate(0, -canvas.height);
    ctx.stroke(); // Draw the reflection
    ctx.restore();
}
draw();
