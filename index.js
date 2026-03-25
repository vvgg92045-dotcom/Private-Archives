import express from 'express';
import B2 from 'backblaze-b2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load .env if exists

const app = express();
app.use(cors());
app.use(express.json());

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID || 'YOUR_KEY_ID',
  applicationKey: process.env.B2_APP_KEY || 'YOUR_APP_KEY'
});

await b2.authorize();

const BUCKET = process.env.BUCKET_NAME || 'private-archive-videos';

// Endpoint to return all videos/images by channel
app.get('/api/channels', async (req, res) => {
  try {
    const list = await b2.listFileNames({ bucketId: BUCKET });
    const data = {};

    list.data.files.forEach(file => {
      const [channel, fileName] = file.fileName.split('/');
      if (!data[channel]) data[channel] = [];
      data[channel].push(`https://f002.backblazeb2.com/file/${BUCKET}/${file.fileName}`);
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching files from B2');
  }
});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});