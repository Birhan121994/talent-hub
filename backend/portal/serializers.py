from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Job, Application
import os

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    resume = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirmation', 
                 'first_name', 'last_name', 'role', 'phone', 'company', 'resume')
    
    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate resume file if provided
        resume = data.get('resume')
        if resume:
            # Check file size (max 5MB)
            if resume.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Resume file size must be less than 5MB")
            
            # Check file extension
            valid_extensions = ['.pdf', '.doc', '.docx']
            ext = os.path.splitext(resume.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError("Resume must be a PDF, DOC, or DOCX file")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirmation')
        password = validated_data.pop('password')
        resume = validated_data.pop('resume', None)
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        
        # Handle resume upload
        if resume:
            user.resume_original_name = resume.name
            user.resume.save(resume.name, resume, save=False)
        
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("User account is disabled.")
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include username and password.")
        
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'phone', 'company', 'resume', 'resume_original_name')


class JobSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    application_count = serializers.SerializerMethodField()
    is_recommended = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = '__all__'
    
    def get_application_count(self, obj):
        return obj.applications.count()

    def get_is_recommended(self, obj):
        # This will be set by the recommendation view
        request = self.context.get('request')
        if request and hasattr(request, 'recommended_job_ids'):
            return obj.id in request.recommended_job_ids
        return False

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'

class ApplicationCreateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)  # Make resume optional
    
    class Meta:
        model = Application
        fields = ('job', 'cover_letter', 'resume')
    
    def validate(self, data):
        # Check if user has a resume in their profile if no resume is provided
        if 'resume' not in data and not self.context['request'].user.resume:
            raise serializers.ValidationError(
                {"resume": "Please upload a resume to your profile or provide one with your application"}
            )
        return data
    
    def validate_resume(self, value):
        if value:
            # Validate file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Resume file size must be less than 5MB")
            
            # Validate file extension
            valid_extensions = ['.pdf', '.doc', '.docx']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError("Resume must be a PDF, DOC, or DOCX file")
        
        return value
    
    def create(self, validated_data):
        resume = validated_data.pop('resume', None)
        application = Application.objects.create(**validated_data)
        
        # Use profile resume if no resume is provided in the application
        if not resume and self.context['request'].user.resume:
            application.resume = self.context['request'].user.resume
            application.resume_original_name = self.context['request'].user.resume_original_name
        elif resume:
            # Save uploaded resume
            application.resume_original_name = resume.name
            application.resume.save(resume.name, resume)
        
        application.save()
        return application