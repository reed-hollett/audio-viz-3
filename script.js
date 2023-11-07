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

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = document.querySelector('.container').clientWidth;
canvas.height = window.innerHeight * 0.8;

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // Clear the canvas for each animation frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the beige background for the circular visualization
    ctx.fillStyle = '#F0E7DE'; // Beige color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center of the canvas
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let radius = 100;

    for (let i = 0; i < bufferLength; i++) {
        // Get the frequency value
        const value = dataArray[i];
        // Calculate the bar length based on the frequency value
        const barLength = (value / 255.0) * (canvas.height / 2 - radius);
        // Set the angle for each bar
        const angle = (i / bufferLength) * Math.PI * 2;
        // Calculate x and y for the start and end points of each bar
        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + (radius + barLength) * Math.cos(angle);
        const y2 = centerY + (radius + barLength) * Math.sin(angle);

        // Create a gradient for the bars
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, '#ff4500'); // Orange
        gradient.addColorStop(0.5, '#de3730'); // Red
        gradient.addColorStop(1, '#800020'); // Burgundy

        // Draw the bars
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
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
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});

// Call draw function to initialize the visualization
draw();
