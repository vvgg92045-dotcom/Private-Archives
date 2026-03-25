import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import B2 from "backblaze-b2";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // CORS erlauben
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Public Folder

// Backblaze Setup
const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APP_KEY,
});

let bucketName = process.env.B2_BUCKET_NAME;

// Video Liste abrufen
app.get("/api/videos", async (req, res) => {
    try {
        await b2.authorize();
        const response = await b2.listFileNames({ bucketId: bucketName });
        // Liste von Dateinamen nur
        const files = response.data.files.map(f => f.fileName);
        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Laden der Videos" });
    }
});

// Datei-URL abrufen
app.get("/api/video/:name", async (req, res) => {
    const name = req.params.name;
    try {
        await b2.authorize();
        const downloadAuth = await b2.getDownloadAuthorization({
            bucketId: bucketName,
            fileNamePrefix: name,
            validDurationInSeconds: 60 * 60, // 1 Stunde gültig
        });
        const url = `https://f${process.env.B2_ENDPOINT}.backblazeb2.com/file/${bucketName}/${name}?Authorization=${downloadAuth.data.authorizationToken}`;
        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Generieren der URL" });
    }
});

// Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});