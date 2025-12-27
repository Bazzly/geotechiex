const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files
// Set up file storage with original filenames
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'data/'),
        filename: (req, file, cb) => cb(null, file.originalname),
    }),
});

const dataFolder = path.join(__dirname, 'data');

// Ensure the data folder exists
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

// Helper: read API keys from env or config
const HF_TOKEN = process.env.HF_TOKEN || '';
const OCR_SPACE_TOKEN = process.env.OCR_SPACE_TOKEN || '';

const axios = require('axios');
const FormData = require('form-data');



// Routes

// File upload
app.post('/upload', upload.single('geojsonFile'), (req, res) => {
    if (req.file) {
        res.status(200).send('File uploaded successfully!');
    } else {
        res.status(400).send('File upload failed.');
    }
});

// Fetch files
app.get('/files', (req, res) => {
    fs.readdir(dataFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Failed to fetch files.');
        }
        res.json(files);
    });
});

// Delete file
app.delete('/delete', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(dataFolder, fileName);

    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).send('Failed to delete file.');
        }
        res.send('File deleted successfully.');
    });
});

// Rename file
// Rename file
app.post('/rename', express.json(), (req, res) => {
    const { oldFileName, newFileName } = req.body;
    const oldFilePath = path.join(__dirname, 'data', oldFileName);
    const newFilePath = path.join(__dirname, 'data', newFileName);

    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            res.status(500).send('Failed to rename file.');
        } else {
            res.send('File renamed successfully.');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Proxy endpoint: /api/analyze-image
// Accepts multipart 'file' and returns { ocrText, hfCaption }
app.post('/api/analyze-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = path.join(__dirname, req.file.path || req.file.filename || req.file.originalname);

        // 1) Call OCR.space if token available
        let ocrText = null;
        const ocrToken = process.env.OCR_SPACE_TOKEN || OCR_SPACE_TOKEN;
        if (ocrToken) {
            const fd = new FormData();
            fd.append('apikey', ocrToken);
            fd.append('file', fs.createReadStream(req.file.path));
            fd.append('language', 'eng');
            const ocrResp = await axios.post('https://api.ocr.space/parse/image', fd, { headers: fd.getHeaders() });
            if (ocrResp.data && ocrResp.data.ParsedResults && ocrResp.data.ParsedResults.length) {
                ocrText = ocrResp.data.ParsedResults.map(p=>p.ParsedText).join('\n');
            }
        }

        // 2) Call Hugging Face image caption model if token available
        let hfCaption = null;
        const hfToken = process.env.HF_TOKEN || HF_TOKEN;
        if (hfToken) {
            // Read file and convert to base64
            const buffer = fs.readFileSync(req.file.path);
            const base64 = `data:${req.file.mimetype};base64,` + buffer.toString('base64');
            try {
                const hfResp = await axios.post('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', { inputs: base64 }, { headers: { Authorization: `Bearer ${hfToken}` } });
                if (hfResp.data) {
                    if (Array.isArray(hfResp.data) && hfResp.data.length) hfCaption = hfResp.data[0].generated_text || hfResp.data[0].caption || null;
                    else if (hfResp.data.generated_text) hfCaption = hfResp.data.generated_text;
                }
            } catch (e) {
                console.warn('Hugging Face API error', e && e.response ? e.response.data : e.message || e);
            }
        }

        // Return merged result
        return res.json({ ocrText, hfCaption });
    } catch (err) {
        console.error('analyze-image error', err);
        return res.status(500).json({ error: err.message || err });
    }
});
