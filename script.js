const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const timeCounter = document.getElementById('timeCounter');
const dropdownButton = document.querySelector('.dropdown-button');
const file1 = document.getElementById('file1');
const file2 = document.getElementById('file2');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

canvas.width = document.querySelector('.container').clientWidth - 32;
canvas.height = window.innerHeight * 0.8;

const history = [];

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    history.push(averageVolume);
    if (history.length > canvas.width * 0.65) history.shift();

    ctx.fillStyle = '#F0E7DE';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let offset = 10; offset > 0; offset--) {
        ctx.lineWidth = offset * 2;
        const opacity = 1 - (offset / 10);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;

        for (let h = 0; h < history.length; h++) {
            const x = h;
            const height = (history[h] / 256) * canvas.height;
            const halfHeight = height / 2;
            const y = canvas.height / 2;

            ctx.beginPath();
            ctx.moveTo(x, y - halfHeight);
            ctx.lineTo(x, y + halfHeight);
            ctx.stroke();
        }
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FD8775';

    for (let h = 0; h < history.length; h++) {
        const x = h;
        const height = (history[h] / 256) * canvas.height;
        const halfHeight = height / 2;
        const y = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(x, y - halfHeight);
        ctx.lineTo(x, y + halfHeight);
        ctx.stroke();
    }
}

function playPauseAudio() {
    if (audio.paused) {
        audioContext.resume().then(() => {
            audio.play();
            draw();
            playButton.innerText = 'Pause';
        });
    } else {
        audio.pause();
        playButton.innerText = 'Play';
    }
}

playButton.addEventListener('click', playPauseAudio);

file1.addEventListener('click', function() {
    if (audio.src !== 'frank-dukes.mp3') {
        audio.src = 'frank-dukes.mp3';
        dropdownButton.innerText = 'frank-dukes.mp3';
        playPauseAudio();
    }
});

file2.addEventListener('click', function() {
    if (audio.src !== 'ssaliva.mp3') {
        audio.src = 'ssaliva.mp3';
        dropdownButton.innerText = 'ssaliva.mp3';
        playPauseAudio();
    }
});

audio.addEventListener('timeupdate', function() {
    const currentTime = audio.currentTime;
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = (currentTime % 60).toFixed(2).padStart(5, '0');
    timeCounter.textContent = `• ${minutes}:${seconds}`;
});

audio.addEventListener('error', function(e) {
    console.error('Error encountered:', e);
});
