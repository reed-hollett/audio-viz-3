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

function drawSinusoidal() {
  requestAnimationFrame(drawSinusoidal);

  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = '#F0E7DE';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DE3730';

  ctx.beginPath();

  let sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
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

  // Reflect the waveform across the center of the canvas
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#DE3730';
  ctx.stroke();
  ctx.restore();
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
    drawSinusoidal();
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

// Make sure to resize the canvas when the window resizes
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
});
