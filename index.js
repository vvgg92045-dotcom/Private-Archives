import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import B2 from '@backblaze/b2';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Backblaze B2 init
const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

// Authentifizierung
await b2.authorize();

// Beispiel: Liste aller Dateien im Bucket
async function listFiles() {
  const res = await b2.listFileNames({ bucketId: process.env.B2_BUCKET_NAME });
  return res.data.files.map(f => f.fileName);
}

// Route für Frontend
app.get('/api/videos', async (req, res) => {
  try {
    const files = await listFiles();
    // Optional: nur Videos anzeigen
    const videos = files.filter(f => /\.(mp4|mov|webm)$/i.test(f));
    res.json({ videos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'B2 Fehler' });
  }
});

// Route für direkte Video-URL
app.get('/api/video/:name', async (req, res) => {
  const fileName = req.params.name;
  try {
    const download = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_NAME,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600 // 1h Link
    });
    res.json({ url: `${process.env.B2_ENDPOINT}${process.env.B2_BUCKET_NAME}/${fileName}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'B2 Download Fehler' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server läuft auf Port ${process.env.PORT || 3000}`);
});