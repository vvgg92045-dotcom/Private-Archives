const feed = document.getElementById("feed");
const feedVideo = document.getElementById("feedVideo");
const back = document.querySelector(".back-arrow");

async function loadFeed(){
  const activeChannel = localStorage.getItem("activeChannel");
  const currentVideo = localStorage.getItem("currentVideo");

  const res = await fetch('/api/channels');
  const allData = await res.json();
  const videos = allData[activeChannel];
  let currentIndex = videos.indexOf(currentVideo);

  function play(){
    feedVideo.src = `uploads/${activeChannel}/${videos[currentIndex]}`;
    feedVideo.play();
    feed.style.display="block";
  }

  function next(){ currentIndex=(currentIndex+1)%videos.length; play(); }
  function prev(){ currentIndex=(currentIndex-1+videos.length)%videos.length; play(); }

  let startY=0;
  feed.addEventListener("touchstart", e=>{ startY=e.touches[0].clientY; });
  feed.addEventListener("touchend", e=>{
    let endY=e.changedTouches[0].clientY;
    if(startY-endY>50) next();
    if(endY-startY>50) prev();
  });

  back.onclick = function(){
    feedVideo.pause();
    feedVideo.src="";
    window.history.back();
  }

  play();
}

window.onload = loadFeed;
