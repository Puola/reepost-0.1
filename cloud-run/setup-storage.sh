#!/bin/bash

# Set project ID
PROJECT_ID="reepost-f6b39"

# Create storage buckets
gsutil mb -p $PROJECT_ID -l us-central1 gs://reepost-videos-input
gsutil mb -p $PROJECT_ID -l us-central1 gs://reepost-videos-output

# Set CORS configuration for the buckets
cat > cors.json << 'EOF'
[
  {
    "origin": ["https://reepost.co", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://reepost-videos-input
gsutil cors set cors.json gs://reepost-videos-output

# Create service account for Cloud Run
gcloud iam service-accounts create video-processor \
  --display-name="Video Processor Service Account"

# Get the service account email
SA_EMAIL="video-processor@$PROJECT_ID.iam.gserviceaccount.com"

# Grant Storage Object Viewer to input bucket
gsutil iam ch \
  serviceAccount:$SA_EMAIL:roles/storage.objectViewer \
  gs://reepost-videos-input

# Grant Storage Object Admin to output bucket
gsutil iam ch \
  serviceAccount:$SA_EMAIL:roles/storage.objectAdmin \
  gs://reepost-videos-output

# Grant service account access to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.invoker"

# Clean up
rm cors.json