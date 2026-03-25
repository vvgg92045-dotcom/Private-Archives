// index.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === 1️⃣ Statische Dateien ausliefern ===
app.use(express.static('public'));

// === 2️⃣ Upload Middleware ===
const upload = multer({ storage: multer.memoryStorage() });

// === 3️⃣ AWS S3 Setup ===
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,      // von Render Environment Variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// === 4️⃣ Upload-Route ===
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Keine Datei hochgeladen');

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,          // von Render Environment Variables
    Key: req.file.originalname,
    Body: req.file.buffer
  };

  try {
    const data = await s3.upload(params).promise();
    res.send({ message: 'Upload erfolgreich!', url: data.Location });
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Upload');
  }
});

// === 5️⃣ Fallback für alle anderen Routen ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === 6️⃣ Server starten ===
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));