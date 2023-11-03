const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const history = []; // To store past volume levels

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    history.push(averageVolume);
    if (history.length > canvas.width / 2) history.shift();

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00FF00';

    for (let h = 0; h < history.length; h++) {
        const x = canvas.width / 2 + h; // Start from the center and scroll to the right
        const height = history[h] / 2; // Adjusting the height for better visibility
        const y = canvas.height / 2 - height / 2; // Centering vertically

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

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
