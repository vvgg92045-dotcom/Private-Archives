// List all your video filenames here
const videos = [
  'uploads/honoka7.mp4',
  'uploads/marierose3.mp4',
  'uploads/marierose3bonus.mp4'
];

let current = 0; // current video index
const preview = document.getElementById('preview');
const nextBtn = document.getElementById('nextBtn');

function playPreview(index) {
    preview.src = videos[index];
    preview.play();

    // autoplay for 1 second, then next video
    setTimeout(() => {
        current = (current + 1) % videos.length;
        playPreview(current);
    }, 1000);
}

// Button to skip manually
nextBtn.addEventListener('click', () => {
    current = (current + 1) % videos.length;
    playPreview(current);
});

// start autoplay when page loads
playPreview(current);