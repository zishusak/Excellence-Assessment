const csvParser = require('csv-parser');
const multer = require('multer');

// Set up multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
});

const csvMiddleware = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];

  // Use buffer stream to process the uploaded file
  const stream = require('stream');
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  bufferStream
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      req.csvData = results;
      next();
    })
    .on('error', (err) => {
      return res.status(500).json({ error: 'Error parsing CSV file' });
    });
};

module.exports = { upload, csvMiddleware };
