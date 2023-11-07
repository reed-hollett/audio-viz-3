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

analyser.fftSize = 2048; // Use a larger FFT size for more detailed waveform
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = document.querySelector('.container').clientWidth;
canvas.height = window.innerHeight * 0.8;

let xOffset = 0; // This offset will control the horizontal scrolling of our waveform

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray); // Use time domain data for waveform

    ctx.fillStyle = '#F0E7DE'; // Beige background to match the container
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#DE3730'; // Red waveform
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0; // Start drawing at the beginning of the canvas

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 128 is for unsigned 8-bit array
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Create a scrolling effect by translating the canvas
    xOffset -= 2; // Speed of the scrolling
    ctx.translate(xOffset, 0);

    // When the waveform scrolls off the canvas, reset translation and start over
    if (-xOffset >= canvas.width) {
        xOffset = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix
    }
}

playButton.addEventListener('click', function() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (audio.paused) {
        audio.play();
        playButton.textContent = 'Pause';
    } else {
        audio.pause();
        playButton.textContent = 'Play';
    }
    draw();
});

audio.addEventListener('timeupdate', function() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('ended', function() {
    playButton.textContent = 'Play';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation matrix when the song ends
    xOffset = 0; // Reset offset
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
