const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 2048; // Using a larger FFT size for waveform data
const bufferLength = analyser.fftSize;
const dataArray = new Float32Array(bufferLength); // Using Float32Array for waveform data

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function draw() {
    requestAnimationFrame(draw);

    analyser.getFloatTimeDomainData(dataArray); // Get waveform data

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00FF00'; // Green color for the waveform

    ctx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 200; // Amplifying the waveform for better visibility
        const y = v + canvas.height / 2; // Centering the waveform vertically

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

playButton.addEventListener('click', function() {
    audioContext.resume().then(() => {
        audio.play();
        draw();
    });
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
