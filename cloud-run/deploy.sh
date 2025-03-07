#!/bin/bash

# Set project ID and region
PROJECT_ID="reepost-f6b39"
REGION="us-central1"

# Build the container
gcloud builds submit --tag gcr.io/$PROJECT_ID/video-processor

# Deploy to Cloud Run
gcloud run deploy video-processor \
  --image gcr.io/$PROJECT_ID/video-processor \
  --platform managed \
  --region $REGION \
  --service-account video-processor@$PROJECT_ID.iam.gserviceaccount.com \
  --memory 2Gi \
  --cpu 2 \
  --timeout 900 \
  --concurrency 10 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID"