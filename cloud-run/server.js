const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Cloud Storage
const storage = new Storage();
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Video processing service is running');
});

// Process video endpoint
app.post('/process-video', async (req, res) => {
  const {
    inputBucket,
    inputFile,
    outputBucket,
    outputFile,
    format = 'vertical', // vertical or horizontal
    duration = 'default' // default, short, or long
  } = req.body;

  if (!inputBucket || !inputFile || !outputBucket || !outputFile) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const tempInputPath = path.join(os.tmpdir(), 'input-' + Date.now() + path.extname(inputFile));
  const tempOutputPath = path.join(os.tmpdir(), 'output-' + Date.now() + '.mp4');

  try {
    // Download input file
    await storage.bucket(inputBucket).file(inputFile).download({ destination: tempInputPath });

    // Process video based on format
    await new Promise((resolve, reject) => {
      let command = ffmpeg(tempInputPath)
        .outputOptions('-c:v libx264')
        .outputOptions('-preset fast')
        .outputOptions('-crf 22');

      if (format === 'vertical') {
        command
          .size('1080x1920')
          .autopad(true, 'black');
      } else {
        command
          .size('1920x1080')
          .autopad(true, 'black');
      }

      if (duration === 'short') {
        command.duration(60);
      }

      command
        .output(tempOutputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Upload processed file
    await storage.bucket(outputBucket).upload(tempOutputPath, {
      destination: outputFile,
      metadata: {
        contentType: 'video/mp4'
      }
    });

    // Cleanup
    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(tempOutputPath);

    res.json({
      success: true,
      output: {
        bucket: outputBucket,
        file: outputFile
      }
    });
  } catch (error) {
    console.error('Error processing video:', error);
    
    // Cleanup on error
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    
    res.status(500).json({
      error: 'Failed to process video',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Video processing service listening on port ${port}`);
});