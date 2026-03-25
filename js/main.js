const content = document.getElementById("content");
let data = {};
const uploadsPath = "uploads/";

async function loadChannels(){
  try{
    const res = await fetch('/api/channels');
    data = await res.json();
    showChannels();
  } catch(e){
    console.error("Kanäle konnten nicht geladen werden", e);
  }
}

function showChannels(){
  content.innerHTML = '<h1 style="width:100%; text-align:center; margin-bottom:20px;"> Private Archive</h1>';
  Object.keys(data).forEach(channel=>{
    const card = document.createElement("div");
    card.className="channel-card";
    const img = document.createElement("img");
    img.src = `${uploadsPath}${channel}/profile.jpg`;
    img.onerror = ()=>{ img.src="placeholder.jpg"; }
    const name = document.createElement("span"); name.innerText = channel;
    card.appendChild(img); card.appendChild(name);
    card.onclick = ()=> openChannel(channel);
    content.appendChild(card);
  });
}

function openChannel(channel){
  window.location.href = `channel.html?channel=${encodeURIComponent(channel)}`;
}

window.onload = loadChannels;