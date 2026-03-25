// index.js – lädt Videos direkt von Backblaze B2
const bucketEndpoint = "https://f000.backblazeb2.com/file/private-archive-videos"; 
// Ersetze durch deinen Bucket Public URL oder Cloudflare-Proxy-URL, wenn privat
// Struktur im Bucket: bucket/CHANNEL/VIDEO

let data = {
  "Dead Or Alive": ["profile.jpg", "video1.mp4", "video2.mp4"],
  "Nature": ["forest.mp4", "river.mp4"],
  // weitere Channels + Videos hier eintragen
};

let allVideos = [];
let selectedVideos = [];
let index = 0;
let likes = {}, views = {}, favs = {};

const video = document.getElementById("video");
const bgVideo = document.getElementById("bgVideo");

window.onload = () => {
  prepareAllVideos();
  startBG();
  loadGrid();
};

// Bereitet allVideos Array
function prepareAllVideos() {
  Object.keys(data).forEach(ch => {
    data[ch].forEach(v => {
      allVideos.push({ ch, v });
    });
  });
}

// Hintergrundvideo-Rotation
function startBG() {
  let vids = allVideos.map(v => `${bucketEndpoint}/${v.ch}/${v.v}`);
  let i = 0;

  function playNext() {
    bgVideo.src = vids[i];
    bgVideo.play();
    i = (i + 1) % vids.length;
  }

  bgVideo.onended = playNext;
  playNext();
}

// Grid laden
function loadGrid() {
  const foryou = document.getElementById("foryou");
  foryou.innerHTML = "";
  allVideos.forEach((v, i) => {
    const vid = document.createElement("video");
    vid.src = `${bucketEndpoint}/${v.ch}/${v.v}`;
    vid.muted = true;
    vid.preload = "metadata";

    vid.onclick = () => {
      if (selectedVideos.includes(i)) {
        selectedVideos = selectedVideos.filter(x => x !== i);
        vid.classList.remove("selected");
      } else {
        selectedVideos.push(i);
        vid.classList.add("selected");
      }
    };

    vid.ondblclick = () => openFeed(i);

    foryou.appendChild(vid);
  });
}

// Feed Funktionen
function openFeed(i) {
  index = i;
  const feed = document.getElementById("feed");
  feed.style.display = "block";
  play();
  if (feed.requestFullscreen) feed.requestFullscreen();
}

function play() {
  const v = allVideos[index];
  video.src = `${bucketEndpoint}/${v.ch}/${v.v}`;
  video.play();
}

function closeFeed() {
  video.pause();
  video.src = "";
  const feed = document.getElementById("feed");
  feed.style.display = "none";
  if (document.fullscreenElement) document.exitFullscreen();
}

// Sound
function toggleSound() {
  video.muted = !video.muted;
}

// Like / Fav / View
function like() { likes[index] = (likes[index] || 0) + 1; }
function fav() { favs[index] = true; }
video.onplay = () => views[index] = (views[index] || 0) + 1;

// Progress
video.ontimeupdate = () => {
  const progress = document.getElementById("progress");
  progress.style.width = (video.currentTime / video.duration * 100) + "%";
};

// Swipe
let startY = 0;
const feed = document.getElementById("feed");
feed.addEventListener("touchstart", e => startY = e.touches[0].clientY);
feed.addEventListener("touchend", e => {
  let endY = e.changedTouches[0].clientY;
  if (startY - endY > 50) next();
  if (endY - startY > 50) prev();
});

function next() { index = (index + 1) % allVideos.length; play(); }
function prev() { index = (index - 1 + allVideos.length) % allVideos.length; play(); }

// Highlight
async function createHighlight() {
  if (selectedVideos.length < 2) { alert("Mind. 2 Videos!"); return; }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream);

  let chunks = [];
  rec.ondataavailable = e => chunks.push(e.data);

  rec.onstop = () => {
    const url = URL.createObjectURL(new Blob(chunks));
    const v = document.createElement("video");
    v.src = url;
    v.controls = true;
    v.autoplay = true;
    v.style.position = "fixed";
    v.style.width = "80%";
    v.style.top = "50%";
    v.style.left = "50%";
    v.style.transform = "translate(-50%,-50%)";
    document.body.appendChild(v);
  };

  rec.start();
  for (let i of selectedVideos) await clip(i, ctx, canvas);
  rec.stop();
  selectedVideos = [];
}

function clip(i, ctx, canvas) {
  return new Promise(res => {
    let v = document.createElement("video");
    let d = allVideos[i];
    v.src = `${bucketEndpoint}/${d.ch}/${d.v}`;
    v.muted = true;
    v.preload = "auto";
    v.onloadeddata = () => {
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      v.currentTime = v.duration * 0.3;
      v.play();
      let start = null;
      function draw(t) {
        if (!start) start = t;
        if (v.readyState >= 2) ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        if ((t - start) / 1000 < 2.5) requestAnimationFrame(draw);
        else { v.pause(); res(); }
      }
      requestAnimationFrame(draw);
    };
  });
}

// Vote
function startVote() {
  if (selectedVideos.length < 2) { alert("2 Videos wählen!"); return; }
  let a = selectedVideos[0], b = selectedVideos[1];
  let v1 = allVideos[a], v2 = allVideos[b];

  let box = document.createElement("div");
  box.style.position = "fixed";
  box.style.width = "100%";
  box.style.height = "100%";
  box.style.display = "flex";

  box.innerHTML = `
    <video src="${bucketEndpoint + "/" + v1.ch + "/" + v1.v}" style="width:50%" autoplay muted></video>
    <video src="${bucketEndpoint + "/" + v2.ch + "/" + v2.v}" style="width:50%" autoplay muted></video>
  `;

  box.onclick = () => { alert("Gewählt!"); box.remove(); };
  document.body.appendChild(box);
}

// Profile
function saveProfile() {
  const username = document.getElementById("username");
  const nameInput = document.getElementById("nameInput");
  localStorage.setItem("username", nameInput.value);
  username.innerText = nameInput.value;
}

// Tabs
function switchTab(tab, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  document.getElementById("foryou").style.display = "none";
  document.getElementById("sub").style.display = "none";
  document.getElementById("trending").style.display = "none";
  document.getElementById("searchPage").style.display = "none";
  document.getElementById("profile").style.display = "none";

  if (tab === "foryou") document.getElementById("foryou").style.display = "grid";
  if (tab === "search") document.getElementById("searchPage").style.display = "block";
  if (tab === "profile") document.getElementById("profile").style.display = "block";
}