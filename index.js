import express from 'express';
import B2 from 'backblaze-b2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const b2 = new B2({
  applicationKeyId: 'YOUR_KEY_ID',       // Replace with your B2 app key ID
  applicationKey: 'YOUR_APP_KEY'         // Replace with your B2 app key
});

await b2.authorize();

const BUCKET = 'private-archive-videos';

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

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});