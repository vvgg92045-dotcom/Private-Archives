import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import B2 from 'backblaze-b2';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Backblaze B2 setup
const b2 = new B2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});
const bucketName = process.env.B2_BUCKET_NAME;

// Autorisieren
await b2.authorize();

// Hilfsfunktion zum Auflisten der Dateien im Bucket
async function listFiles() {
  const response = await b2.listFileNames({ bucketId: bucketName });
  return response.data.files.map(f => f.fileName);
}

// API Endpoints
app.get('/api/videos', async (req, res) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});