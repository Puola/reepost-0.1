import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const VIDEO_PROCESSOR_URL = import.meta.env.VITE_VIDEO_PROCESSOR_URL;

if (!VIDEO_PROCESSOR_URL) {
  console.warn('Video processor URL not configured. Set VITE_VIDEO_PROCESSOR_URL in .env');
}

export interface ProcessVideoOptions {
  format?: 'vertical' | 'horizontal';
  duration?: 'default' | 'short' | 'long';
}

export async function uploadVideo(file: File, options: ProcessVideoOptions = {}) {
  try {
    // Upload original video to input bucket
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const inputRef = ref(storage, `videos-input/${fileName}`);
    
    await uploadBytes(inputRef, file);
    const inputUrl = await getDownloadURL(inputRef);

    // Process video using Cloud Run service
    const response = await fetch(`${VIDEO_PROCESSOR_URL}/process-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputBucket: 'reepost-videos-input',
        inputFile: fileName,
        outputBucket: 'reepost-videos-output',
        outputFile: `processed-${fileName}`,
        format: options.format || 'vertical',
        duration: options.duration || 'default'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to process video');
    }

    const result = await response.json();
    
    // Get the processed video URL
    const outputRef = ref(storage, `videos-output/${result.output.file}`);
    const processedUrl = await getDownloadURL(outputRef);

    return {
      originalUrl: inputUrl,
      processedUrl: processedUrl,
      format: options.format,
      duration: options.duration
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}