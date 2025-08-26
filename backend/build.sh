#!/usr/bin/env bash
# Exit on error
set -o errexit

# Upgrade pip to latest version
pip install --upgrade pip

# Install system dependencies required for Pillow
apt-get update && apt-get install -y \
    libjpeg-dev \
    libopenjp2-7-dev \
    zlib1g-dev \
    libfreetype6-dev

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate