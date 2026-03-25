import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import B2 from "backblaze-b2";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Backblaze B2 Setup ---
const b2 = new B2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

await b2.authorize();

// --- Helper: Liste aller Dateien pro Channel ---
async function listFiles() {
  const bucketId = await getBucketId();
  let files = [];
  let next = null;

  do {
    const response = await b2.listFileNames({
      bucketId,
      startFileName: next,
      maxFileCount: 1000
    });
    files = files.concat(response.data.files);
    next = response.data.nextFileName;
  } while (next);

  // Gruppiere nach Channel (Ordnerstruktur: channel/file)
  const channels = {};
  files.forEach(f => {
    const parts = f.fileName.split("/");
    const ch = parts[0];
    const file = parts.slice(1).join("/");
    if (!channels[ch]) channels[ch] = [];
    channels[ch].push(file);
  });
  return channels;
}

async function getBucketId() {
  const buckets = await b2.listBuckets();
  const bucket = buckets.data.buckets.find(b => b.bucketName === process.env.B2_BUCKET_NAME);
  return bucket.bucketId;
}

// --- API Endpoints ---

// Liste aller Channels und Videos
app.get("/api/channels", async (req, res) => {
  try {
    const channels = await listFiles();
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list channels" });
  }
});

// Video Stream
app.get("/api/video/:channel/:file", async (req, res) => {
  try {
    const bucketId = await getBucketId();
    const { channel, file } = req.params;
    const fileName = `${channel}/${file}`;

    const auth = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600
    });

    const downloadUrl = `https://f000.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${auth.data.authorizationToken}`;
    res.redirect(downloadUrl);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "File not found" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});