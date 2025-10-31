#!/usr/bin/env bash
set -e

# Usage: ./deploy.sh <tag>
# Example: ./deploy.sh main

IMAGE="ghcr.io/longdog/ai-advent-4"
CONTAINER_NAME="ai"
TAG="${1:-latest}"

echo "🔹 Deploying image: ${IMAGE}:${TAG}"

# Stop and remove old container if exists
if [ "$(sudo docker ps -aq -f name=${CONTAINER_NAME})" ]; then
  echo "🛑 Stopping existing container..."
  sudo docker rm -f ${CONTAINER_NAME}
fi

# Pull the new image
echo "⬇️  Pulling new image..."
sudo docker pull ${IMAGE}:${TAG}

# Run the new container
echo "🚀 Starting new container..."
sudo docker run -d \
  --name ${CONTAINER_NAME} \
  -p 5555:5555 \
  ${IMAGE}:${TAG}

echo "✅ Deployed ${IMAGE}:${TAG} and running on port 5555."
