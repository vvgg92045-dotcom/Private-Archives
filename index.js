import express from 'express';
import cors from 'cors';
import B2 from 'backblaze-b2';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY
});

await b2.authorize();

// Endpunkt, der alle Videos auflistet
app.get('/api/channels', async (req, res) => {
  try {
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      maxFileCount: 1000
    });

    const files = response.data.files.map(f => f.fileName); // z.B. "Dead Or Alive/video1.mp4"
    
    // URL generieren
    const urls = files.map(f => `https://${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${f}`);
    
    // Gruppieren nach Ordner (Channel)
    const channels = {};
    urls.forEach(url => {
      const parts = url.split('/');
      const ch = parts[parts.length - 2]; // Ordnername
      const file = parts[parts.length - 1]; 
      if (!channels[ch]) channels[ch] = [];
      channels[ch].push(file);
    });

    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching files from Backblaze R2');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));