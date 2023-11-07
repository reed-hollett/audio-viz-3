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

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#DE3730';
    ctx.globalCompositeOperation = 'lighter'; // Creates a 'blobby' effect

    dataArray.forEach((value, i) => {
        const percent = value / 255;
        const height = canvas.height * percent;
        const offset = canvas.height - height - 1;
        const barWidth = canvas.width / bufferLength;

        ctx.fillRect(i * barWidth, offset, barWidth, height);
        ctx.fillRect(i * barWidth, canvas.height - offset, barWidth, -height);
    });

    ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
}
draw();