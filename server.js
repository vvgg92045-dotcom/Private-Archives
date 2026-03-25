// server.js
const express = require('express');
const path = require('path');
const app = express();

// Port für Render
const PORT = process.env.PORT || 3000;

// Statische Dateien
app.use(express.static(path.join(__dirname)));

// Startseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Service Worker und Manifest
app.get('/sw.js', (req,res) => res.sendFile(path.join(__dirname,'sw.js')));
app.get('/manifest.json', (req,res) => res.sendFile(path.join(__dirname,'manifest.json')));

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); res.sendFile(path.join(__dirname, "index.html"));
});

// Optional: API für Videos (falls nötig)
app.get("/api/videos", (req, res) => {
  // Dummy-Array, kann erweitert werden
  res.json([]);
});

// Start Server
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
app.get('/api/channels', (req, res) => {
  let result = {};
  fs.readdirSync(uploadsDir).forEach(folder => {
    const folderPath = path.join(uploadsDir, folder);
    if(fs.statSync(folderPath).isDirectory()){
      const videos = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4'));
      if(videos.length > 0){
        result[folder] = videos;
      }
    }
  });
  res.json(result);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
// API: Kanäle + Videos
app.get('/api/channels', (req, res) => {
  let result = {};
  fs.readdirSync(uploadsDir).forEach(folder => {
    const folderPath = path.join(uploadsDir, folder);
    if(fs.statSync(folderPath).isDirectory()){
      const videos = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4'));
      if(videos.length > 0){
        result[folder] = videos;
      }
    }
  });
  res.json(result);
});

app.listen(3001, () => console.log('Server läuft auf http://localhost:3001'));