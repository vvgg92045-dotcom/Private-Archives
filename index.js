import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import B2 from "backblaze-b2";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

// Authorize B2
await b2.authorize();

// Liefere alle Videos für die Frontend-Tabs
app.get("/api/channels", async (req, res) => {
  try {
    const bucket = process.env.B2_BUCKET_NAME;

    const list = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      maxFileCount: 1000,
    });

    // Struktur: { channelName: [files] }
    const data = {};
    list.data.files.forEach(f => {
      const parts = f.fileName.split("/");
      const channel = parts[0];
      const file = parts.slice(1).join("/");
      if (!data[channel]) data[channel] = [];
      data[channel].push(file);
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Dateien" });
  }
});

// Liefere Video direkt aus B2
app.get("/uploads/:channel/:file", async (req, res) => {
  try {
    const { channel, file } = req.params;
    const fileName = `${channel}/${file}`;

    const downloadUrl = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 60 * 60,
    });

    const url = `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
    res.redirect(url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Laden des Videos");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));