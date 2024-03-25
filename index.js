const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3058;

// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Serve the single page app
app.get('/', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error reading uploads directory');
            return;
        }
        const filesInfo = files.map(file => {
            const stats = fs.statSync(path.join(uploadsDir, file));
            return {
                name: file,
                url: `/uploads/${file}`,
                uploaded: new Date(stats.mtime).toLocaleString(),
                age: ((Date.now() - stats.mtime) / 1000 / 60).toFixed(2) + ' minutes ago'
            };
        }).sort((a, b) => b.mtime - a.mtime); // Sort by most recent
        res.render('index', { files: filesInfo });
    });
});

// Handle file uploads
app.post('/upload', upload.array('files'), (req, res, next) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('Please upload at least one file.');
    }
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running`));
