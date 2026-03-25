// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

// Statische Dateien
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(__dirname));

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