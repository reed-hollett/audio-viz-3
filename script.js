const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 2048;
const bufferLength = analyser.fftSize;
const dataArray = new Float32Array(bufferLength);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const history = []; // To store past waveforms

function draw() {
    requestAnimationFrame(draw);

    analyser.getFloatTimeDomainData(dataArray);

    // Push current dataArray into history
    history.push([...dataArray]);
    if (history.length > canvas.width / 2) history.shift();

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00FF00';

    for (let h = 0; h < history.length; h++) {
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = canvas.width / 2 + h - history.length; // Start from the center and scroll to the right

        for (let i = 0; i < bufferLength; i++) {
            const v = history[h][i] * 200;
            const y = v + canvas.height / 2;

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
