import cloudinary.uploader
import cloudinary.api
from django.conf import settings
import os

def upload_to_cloudinary(file, folder='media'):
    """
    Upload a file to Cloudinary
    """
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto"
        )
        return result
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

def delete_from_cloudinary(public_id):
    """
    Delete a file from Cloudinary
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return None

def get_cloudinary_url(public_id, **kwargs):
    """
    Generate Cloudinary URL for a file
    """
    try:
        url = cloudinary.CloudinaryImage(public_id).build_url(**kwargs)
        return url
    except Exception as e:
        print(f"Error generating Cloudinary URL: {e}")
        return None