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

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#DE3730';

    ctx.beginPath();

    let sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0; // Uint8Array data ranges from 0 to 255
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

    // Store the image data
    let canvasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    waveformHistory.push(canvasImage);

    // Only keep enough data to fill the canvas
    if (waveformHistory.length > canvas.width) {
        waveformHistory.shift();
    }

    // Display the waveform history as a scrolling background
    waveformHistory.forEach((imageData, index) => {
        ctx.putImageData(imageData, index - waveformHistory.length, 0);
    });
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
});

audio.addEventListener('timeupdate', function() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('ended', function() {
    playButton.textContent = 'Play';
    // Reset waveform history
    waveformHistory.length = 0;
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});

// Call draw function to initialize the visualization
draw();
