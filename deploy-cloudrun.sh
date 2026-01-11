#!/bin/bash
# =============================================================================
# Google Cloud Run Deployment Script for GDG Ahmedabad Bureaucracy Breaker
# =============================================================================
# Prerequisites:
# 1. Google Cloud CLI installed: https://cloud.google.com/sdk/docs/install
# 2. Docker installed (for local builds)
# 3. Your $5 Google Cloud credits linked to billing account
#
# Usage: ./deploy-cloudrun.sh
# =============================================================================

set -e  # Exit on error

# Configuration - CHANGE THESE
PROJECT_ID="your-gcp-project-id"      # Your GCP project ID
REGION="asia-south1"                   # Mumbai region (closest to India)
SERVICE_NAME="bureaucracy-breaker"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying Bureaucracy Breaker to Cloud Run ===${NC}"

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not installed${NC}"
    exit 1
fi

# Step 2: Authenticate and set project
echo -e "${YELLOW}Step 2: Setting up GCP project...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud auth configure-docker gcr.io --quiet

# Step 3: Build Docker image
echo -e "${YELLOW}Step 3: Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

# Step 4: Push to Container Registry
echo -e "${YELLOW}Step 4: Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

# Step 5: Deploy to Cloud Run
echo -e "${YELLOW}Step 5: Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --min-instances 0 \
    --max-instances 2 \
    --set-env-vars "NODE_ENV=production" \
    --set-secrets "GOOGLE_GENAI_API_KEY=GOOGLE_GENAI_API_KEY:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Add your API keys to Google Secret Manager (see instructions below)"
echo ""
echo -e "${YELLOW}To add secrets:${NC}"
echo "gcloud secrets create GOOGLE_GENAI_API_KEY --data-file=-"
echo "# Then type your API key and press Ctrl+D"
