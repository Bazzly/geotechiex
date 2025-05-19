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
