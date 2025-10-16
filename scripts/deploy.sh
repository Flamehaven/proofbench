#!/bin/bash
# ProofBench Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-staging}
VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="proofbench"
REGISTRY="ghcr.io/flamehaven"

echo "[>] Deploying ProofBench v${VERSION} to ${ENVIRONMENT}"

# Step 1: Build Docker image
echo "[1/5] Building Docker image..."
docker build -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:latest .

# Step 2: Tag image for registry
echo "[2/5] Tagging image..."
docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker tag ${IMAGE_NAME}:latest ${REGISTRY}/${IMAGE_NAME}:latest

# Step 3: Push to registry
echo "[3/5] Pushing to registry..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
    docker push ${REGISTRY}/${IMAGE_NAME}:latest
else
    echo "[!] Skipping push for ${ENVIRONMENT} environment"
fi

# Step 4: Deploy with docker-compose
echo "[4/5] Deploying containers..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

# Step 5: Health check
echo "[5/5] Running health check..."
sleep 5
HEALTH_STATUS=$(curl -f http://localhost:3000/health 2>/dev/null || echo "unhealthy")

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "[+] Deployment successful!"
    echo "[+] Application running at http://localhost:3000"
else
    echo "[-] Health check failed!"
    echo "[-] Check logs: docker-compose logs"
    exit 1
fi

echo ""
echo "Deployment Summary:"
echo "  Version: ${VERSION}"
echo "  Environment: ${ENVIRONMENT}"
echo "  Image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo "  Status: Running"
