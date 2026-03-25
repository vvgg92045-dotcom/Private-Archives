// js/channel.js
const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const content = document.getElementById("content");

async function loadChannelVideos(){
  const res = await fetch('/api/channels');
  const allData = await res.json();
  const videos = allData[channel];

  // Banner
  const banner = document.createElement("div"); banner.className="banner";
  const bannerImg = document.createElement("img"); bannerImg.src=`uploads/${channel}/profile.jpg`;
  bannerImg.onerror = ()=>{ bannerImg.src="placeholder.jpg"; }
  const nameDiv = document.createElement("div"); nameDiv.className="name"; nameDiv.innerText = channel;
  banner.appendChild(bannerImg); banner.appendChild(nameDiv);
  content.appendChild(banner);

  // Video Grid
  const grid = document.createElement("div"); grid.className="video-grid";
  videos.forEach(v=>{
    const vid = document.createElement("video");
    vid.src = `uploads/${channel}/${v}`;
    vid.onclick = ()=>openFeed(channel, v);
    grid.appendChild(vid);
  });
  content.appendChild(grid);
}

function openFeed(channel, video){
  localStorage.setItem("activeChannel", channel);
  localStorage.setItem("currentVideo", video);
  window.location.href = "feed.html";
}

window.onload = loadChannelVideos;