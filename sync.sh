#!/bin/bash

set -e  # Exit on error
set -o pipefail  # Fail if any command in a pipeline fails

REMOTE_HOST="root@217.114.11.70"
BACKEND_SRC="./yacht_back/build/libs/yacht-0.0.1-SNAPSHOT.jar"
BACKEND_DEST="/root/yacht/backend/yacht-0.0.1-SNAPSHOT.jar"
FRONTEND_SRC="./yacht_front/dist/browser"
FRONTEND_DEST="/root/yacht/frontend/static"

# Function to check if a command exists
command_exists() {
    command -v "$1" > /dev/null 2>&1
}

# Preflight checks
preflight_checks() {
    echo "Checking system requirements..."
    
    # Check required commands
    for cmd in java node npm docker rsync ssh; do
        if ! command_exists "$cmd"; then
            echo "Error: Required command '$cmd' is not installed. Please install it and retry."
            exit 1
        fi
    done
    echo "All required commands are installed."
    
    # Backend: Check Java version
    JAVA_VERSION=$(java -version 2>&1 | awk -F[\".] '/version/ {print $2}')
    if [ "$JAVA_VERSION" -ne 11 ]; then
        echo "Error: Java 11 is required, but found Java $JAVA_VERSION."
        exit 1
    fi
    echo "Java 11 detected."
    
    # Frontend: Check Node.js version
    NODE_VERSION=$(node -v | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    if [[ "$NODE_VERSION" != 16.14.* ]]; then
        echo "Error: Node.js v16.14.x is required, but found v$NODE_VERSION."
        exit 1
    fi
    echo "Node.js v16.14.x detected."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "Error: Docker is not running. Please start Docker and retry."
        exit 1
    fi
    echo "Docker is running."
}

# Build stage
build_project() {
    echo "Building backend..."
    pushd yacht_back > /dev/null
    bash ./gradlew --stop || true
    bash ./gradlew build
    popd > /dev/null
    
    echo "Building frontend..."
    pushd yacht_front > /dev/null
    npm install --force
    npm run build
    popd > /dev/null
}

# Deployment
deploy() {
    echo "Syncing backend JAR..."
    rsync -azv "$BACKEND_SRC" "$REMOTE_HOST:$BACKEND_DEST"
    
    echo "Syncing frontend files..."
    rsync -azv --delete "$FRONTEND_SRC/" "$REMOTE_HOST:$FRONTEND_DEST/"
    
    echo "Running Docker compose on remote server..."
    ssh "$REMOTE_HOST" "cd /root/yacht/ && docker compose build && docker compose up -d --force-recreate"
    
    echo "Deployment completed successfully!"
}

# Run all steps
preflight_checks
build_project
deploy

