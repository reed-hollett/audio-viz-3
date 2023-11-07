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

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;

const maxTrail = 50; // Maximum number of trailing strokes
const trail = Array(maxTrail).fill(null); // Initialize the trail array

function drawCascadingWave() {
    requestAnimationFrame(drawCascadingWave);

    analyser.getByteTimeDomainData(dataArray);
    trail.unshift(new Uint8Array(dataArray)); // Add new data to the start of the trail array
    if (trail.length > maxTrail) trail.pop(); // Remove the oldest data if we exceed the maximum trail length

    ctx.fillStyle = '#F0E7DE'; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each frame of the trail, with each one being more transparent and featuring a color from the range
    trail.forEach((frame, index) => {
        const alpha = (1 - index / maxTrail).toFixed(2);
        
        // Interpolate color from light red to beige/reds to burgundy
        // Note: Adjust the values below to fine-tune the color range
        const redValue = 205 + (index / maxTrail) * (255 - 205); // Start with light red and transition to darker
        const greenValue = 150 - (index / maxTrail) * (150 - 0); // Green component decreases to transition to reds
        const blueValue = 150 - (index / maxTrail) * (150 - 0); // Blue component decreases similarly
        
        ctx.strokeStyle = `rgba(${redValue}, ${greenValue}, ${blueValue}, ${alpha})`;
        ctx.lineWidth = 10; // Width of the waveform lines

        ctx.beginPath();

        let sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = frame[i] / 128.0;
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
    });
}

function updateTime() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
}

playButton.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (audio.paused) {
        audio.play();
        drawCascadingWave();
    } else {
        audio.pause();
    }

    playButton.textContent = audio.paused ? 'Play' : 'Pause';
});

audio.addEventListener('timeupdate', updateTime);

audio.addEventListener('ended', () => {
    playButton.textContent = 'Play';
});

audio.addEventListener('error', (e) => {
    console.error('Error with the audio file:', e);
});

// Resize the canvas to fill browser window dynamically
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    drawCascadingWave();
});

// Start the visualizer with the cascading effect
drawCascadingWave();
