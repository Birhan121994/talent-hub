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

python manage.py shell << END
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
if password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
END
