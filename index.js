import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import B2 from "backblaze-b2";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
});

await b2.authorize();

// API: Liste Videos im Bucket
app.get("/api/videos", async (req, res) => {
  try {
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_NAME,
      maxFileCount: 100,
    });
    const files = response.data.files.map(f => f.fileName);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen der Videos" });
  }
});

// API: Video-Download-Link
app.get("/api/video/:name", async (req, res) => {
  try {
    const fileName = req.params.name;
    const response = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_NAME,
      fileNamePrefix: fileName,
      validDurationInSeconds: 60,
    });
    const downloadUrl = `${process.env.B2_ENDPOINT}/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;
    res.json({ url: downloadUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video konnte nicht geladen werden" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));