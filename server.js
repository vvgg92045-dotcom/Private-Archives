const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

// Statische Dateien
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Multer Setup für Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// API: Kanäle + Videos
app.get('/api/channels', (req, res) => {
  let result = {};
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  fs.readdirSync(uploadsDir).forEach(folder => {
    const folderPath = path.join(uploadsDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const videos = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4'));
      if (videos.length > 0) result[folder] = videos;
    }
  });
  res.json(result);
});

// Upload Endpoint (automatisch in Cloud, siehe Client)
app.post('/api/upload', upload.single('video'), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));