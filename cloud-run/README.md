# Video Processing Service

This service handles video processing for Reepost using FFMPEG in Cloud Run.

## Setup

1. Enable required APIs:
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com
```

2. Set up storage buckets and IAM permissions:
```bash
chmod +x setup-storage.sh
./setup-storage.sh
```

3. Deploy the service:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Usage

Send POST requests to the `/process-video` endpoint:

```json
{
  "inputBucket": "reepost-videos-input",
  "inputFile": "path/to/input.mp4",
  "outputBucket": "reepost-videos-output", 
  "outputFile": "path/to/output.mp4",
  "format": "vertical",
  "duration": "default"
}
```

## Environment Variables

- `GOOGLE_CLOUD_PROJECT`: Set automatically during deployment
- `PORT`: Default 8080, set by Cloud Run

## Resources

- Input bucket: `gs://reepost-videos-input`
- Output bucket: `gs://reepost-videos-output`
- Service account: `video-processor@reepost-f6b39.iam.gserviceaccount.com`