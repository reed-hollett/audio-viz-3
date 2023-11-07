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

    ctx.strokeStyle = '#DE3730';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            let prevX = x - sliceWidth;
            let prevY = (dataArray[i - 1] / 128.0) * canvas.height / 2;
            let cpX = (x + prevX) / 2;
            let cpY = (y + prevY) / 2;

            // Create a sinusoidal effect with the control points
            cpY += (i % 2 === 0) ? 10 : -10;
            
            ctx.quadraticCurveTo(cpX, cpY, x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.save();
    ctx.scale(1, -1); // Flip to draw the reflection
    ctx.translate(0, -canvas.height);
    ctx.stroke();
    ctx.restore();
}
