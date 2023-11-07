function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // Clear the canvas for each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center the circle in the middle of the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3; // adjust radius here

    // Calculate the slice width of each segment of the circle
    const sliceWidth = (Math.PI * 2) / bufferLength;

    ctx.lineWidth = 2; // Width of the circle lines

    // Begin drawing the circular visualization
    ctx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        const barLength = radius * value; // Scale the bar length with the audio value

        // Calculate the angle for this segment
        const angle = sliceWidth * i;

        // Convert polar coordinates (angle, length) to Cartesian coordinates (x, y)
        const x = centerX + Math.cos(angle) * barLength;
        const y = centerY + Math.sin(angle) * barLength;

        // Draw a line segment from the center of the circle outwards
        if (i === 0) {
            ctx.moveTo(x, y); // Move to starting point without drawing a line
        } else {
            ctx.lineTo(x, y); // Draw line to this point
        }
    }

    // Close the path to create a complete circle
    ctx.closePath();

    // Set the color of the circle
    ctx.strokeStyle = '#FD8775';
    ctx.stroke(); // Apply the stroke to the path

    // Optionally, you can fill the circle with a color
    ctx.fillStyle = 'rgba(253, 135, 117, 0.2)'; // Semi-transparent fill
    ctx.fill(); // Fill the path
}

// Call the draw function to start the visualization
draw();
