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

// Define a history array to keep the last N number of lines
const history = [];
const maxHistorySize = canvas.width;

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    const sliceWidth = canvas.width * 1.0 / maxHistorySize;
    let x = 0;

    // Add the new slice to the history
    history.push(new Uint8Array(dataArray));
    if (history.length > maxHistorySize) {
        history.shift(); // Remove the oldest slice
    }

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#DE3730';

    // Draw the accumulated time slices
    history.forEach(function (slice, index) {
        ctx.beginPath();
        let y = (slice[0] / 128.0) * canvas.height / 2;
        ctx.moveTo(x, y);

        for (let i = 1; i < bufferLength; i++) {
            y = (slice[i] / 128.0) * canvas.height / 2;
            ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.stroke();
        x = index * sliceWidth; // Set x for the next slice
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
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});

// Call draw function to initialize the visualization
draw();
