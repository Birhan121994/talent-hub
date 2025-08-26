from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import User, Job, Application
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    JobSerializer, ApplicationSerializer, ApplicationCreateSerializer
)
from django.core.paginator import Paginator
from django.http import FileResponse
import os

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
import math


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        jobs = Job.objects.filter(is_active=True).select_related('created_by')

        # Extract query params
        title = request.query_params.get('search')
        location = request.query_params.get('location')
        min_salary = request.query_params.get('minSalary')
        max_salary = request.query_params.get('maxSalary')
        job_type = request.query_params.get('jobType')
        experience = request.query_params.get('experience')
        sort = request.query_params.get('sort', 'newest')
        all_jobs = request.query_params.get('all') == 'true'

        # Apply filters
        if title:
            jobs = jobs.filter(
                Q(title__icontains=title) |
                Q(description__icontains=title) |
                Q(requirements__icontains=title) |
                Q(created_by__company__icontains=title)
            )
        if location:
            jobs = jobs.filter(location__icontains=location)
        if min_salary:
            try:
                jobs = jobs.filter(salary__gte=int(min_salary))
            except (ValueError, TypeError):
                pass
        if max_salary:
            try:
                jobs = jobs.filter(salary__lte=int(max_salary))
            except (ValueError, TypeError):
                pass
        if job_type:
            jobs = jobs.filter(job_type=job_type)
        if experience:
            jobs = jobs.filter(experience_level=experience)

        # Apply sorting
        if sort == 'newest':
            jobs = jobs.order_by('-created_at')
        elif sort == 'oldest':
            jobs = jobs.order_by('created_at')
        elif sort == 'salary-high':
            jobs = jobs.order_by('-salary')
        elif sort == 'salary-low':
            jobs = jobs.order_by('salary')
        elif sort == 'company':
            jobs = jobs.order_by('created_by__company')

        # ✅ Return all jobs if `?all=true`
        if all_jobs:
            serializer = JobSerializer(jobs, many=True)
            return Response({
                'jobs': serializer.data,
                'total_jobs': jobs.count(),
                'total_pages': 1,
                'current_page': 1,
                'has_next': False,
                'has_previous': False
            })

        # 🔁 Paginate if not all=true
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('pageSize', 9)

        try:
            page_size = int(page_size)
        except (ValueError, TypeError):
            page_size = 9

        paginator = Paginator(jobs, page_size)

        try:
            page_number = int(page)
            jobs_page = paginator.page(page_number)
        except PageNotAnInteger:
            jobs_page = paginator.page(1)
        except EmptyPage:
            jobs_page = paginator.page(paginator.num_pages)

        serializer = JobSerializer(jobs_page, many=True)

        return Response({
            'jobs': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': jobs_page.number,
            'total_jobs': paginator.count,
            'has_next': jobs_page.has_next(),
            'has_previous': jobs_page.has_previous()
        })

    def post(self, request):
        # Require authentication
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Only allow employers or admins to post jobs
        if request.user.role != 'employer' and not request.user.is_staff:
            return Response({'error': 'Only employers can post jobs'}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
class JobDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, pk):
        job = get_object_or_404(Job, pk=pk, is_active=True)
        serializer = JobSerializer(job)
        return Response(serializer.data)
    
    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        
        # Check if user owns the job or is admin
        if job.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only edit your own jobs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        
        # Check if user owns the job or is admin
        if job.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own jobs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete by setting is_active to False
        job.is_active = False
        job.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class ApplicationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role == 'employer':
            # Employers see applications for their jobs
            applications = Application.objects.filter(job__created_by=request.user).order_by('-applied_at')
        else:
            # Developers see their own applications
            applications = Application.objects.filter(applicant=request.user).order_by('-applied_at')
        
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if request.user.role != 'developer':
            return Response(
                {'error': 'Only developers can apply for jobs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Pass the request context to the serializer
        serializer = ApplicationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Check if user already applied for this job
            job = serializer.validated_data['job']
            if Application.objects.filter(job=job, applicant=request.user).exists():
                return Response(
                    {'error': 'You have already applied for this job'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            application = serializer.save(applicant=request.user)
            return Response(
                ApplicationSerializer(application).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ApplicationResumeDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        
        # Check if user has permission to view this resume
        if (application.applicant != request.user and 
            application.job.created_by != request.user and
            not request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to access this resume'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not application.resume:
            return Response(
                {'error': 'No resume found for this application'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Serve the file for download
        try:
            response = FileResponse(application.resume.open('rb'))
            filename = application.resume_original_name or 'resume.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except FileNotFoundError:
            return Response(
                {'error': 'Resume file not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        if (application.applicant != request.user and 
            application.job.created_by != request.user and
            not request.user.is_staff):
            return Response(
                {'error': 'You can only view your own applications or applications for your jobs'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicationSerializer(application)
        return Response(serializer.data)
    
    def put(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        if application.job.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Only job owners can update application status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow status updates
        if 'status' in request.data:
            application.status = request.data['status']
            application.save()
            return Response(ApplicationSerializer(application).data)
        
        return Response(
            {'error': 'Only status can be updated'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class UserApplicationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        if request.user.id != int(user_id) and not request.user.is_staff:
            return Response(
                {'error': 'You can only view your own applications'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(applicant_id=user_id)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        
        if 'resume' not in request.FILES:
            return Response(
                {'error': 'No resume file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resume = request.FILES['resume']
        
        # Validate file size (max 5MB)
        if resume.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'Resume file size must be less than 5MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file extension
        valid_extensions = ['.pdf', '.doc', '.docx']
        ext = os.path.splitext(resume.name)[1].lower()
        if ext not in valid_extensions:
            return Response(
                {'error': 'Resume must be a PDF, DOC, or DOCX file'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete old resume if exists
        if user.resume:
            user.resume.delete(save=False)
        
        # Save new resume
        user.resume_original_name = resume.name
        user.resume.save(resume.name, resume)
        user.save()
        
        return Response(
            {'message': 'Resume uploaded successfully', 'resume': user.resume.url},
            status=status.HTTP_200_OK
        )
    
    def delete(self, request):
        user = request.user
        
        if not user.resume:
            return Response(
                {'error': 'No resume to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the resume file
        user.resume.delete(save=False)
        user.resume_original_name = None
        user.save()
        
        return Response(
            {'message': 'Resume deleted successfully'},
            status=status.HTTP_200_OK
        )

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class DeveloperResumeDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'developer':
            return Response({'error': 'Only developers can access this endpoint'}, status=403)

        if not user.resume:
            return Response({'error': 'No resume found'}, status=404)

        try:
            response = FileResponse(user.resume.open('rb'))
            filename = user.resume_original_name or 'resume.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except FileNotFoundError:
            return Response({'error': 'Resume file not found'}, status=404)


from .recommendation_engine import job_recommender
from .serializers import JobSerializer

class JobRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'developer':
            return Response(
                {'error': 'Job recommendations are only available for developers'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            recommended_jobs = job_recommender.recommend_jobs(user)
            
            # Store recommended job IDs in request context for serializer
            recommended_job_ids = [job.id for job in recommended_jobs]
            request.recommended_job_ids = recommended_job_ids
            
            serializer = JobSerializer(
                recommended_jobs, 
                many=True,
                context={'request': request}
            )
            
            return Response({
                'recommendations': serializer.data,
                'count': len(recommended_jobs)
            })
            
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            # Fallback to newest jobs
            fallback_jobs = Job.objects.filter(is_active=True).order_by('-created_at')[:6]
            serializer = JobSerializer(fallback_jobs, many=True)
            
            return Response({
                'recommendations': serializer.data,
                'count': len(fallback_jobs),
                'message': 'Showing newest jobs as fallback'
            })


from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import io
from datetime import datetime

class ResumeGenerateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data
            template_style = data.get('template', 'modern')
            personal_info = data.get('personal_info', {})
            education = data.get('education', [])
            experience = data.get('experience', [])
            skills = data.get('skills', [])
            projects = data.get('projects', [])
            
            buffer = io.BytesIO()
            
            if template_style == 'modern':
                pdf = self.generate_modern_resume(buffer, personal_info, education, experience, skills, projects)
            elif template_style == 'professional':
                pdf = self.generate_professional_resume(buffer, personal_info, education, experience, skills, projects)
            elif template_style == 'creative':
                pdf = self.generate_creative_resume(buffer, personal_info, education, experience, skills, projects)
            else:
                return Response({'error': 'Invalid template style'}, status=status.HTTP_400_BAD_REQUEST)
            
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            filename = f"resume_{personal_info.get('name', 'developer').replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_modern_resume(self, buffer, personal_info, education, experience, skills, projects):
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=18)
        
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='ModernTitle', fontSize=24, textColor=colors.HexColor('#1E40AF'), spaceAfter=30))
        styles.add(ParagraphStyle(name='ModernHeading', fontSize=14, textColor=colors.HexColor('#1E40AF'), spaceAfter=12))
        styles.add(ParagraphStyle(name='ModernBody', fontSize=11, spaceAfter=6))
        
        story = []
        story.append(Paragraph(personal_info.get('name', ''), styles['ModernTitle']))
        story.append(Paragraph(personal_info.get('title', ''), styles['ModernBody']))
        story.append(Paragraph(f"{personal_info.get('email', '')} | {personal_info.get('phone', '')} | {personal_info.get('location', '')}", styles['ModernBody']))
        story.append(Spacer(1, 20))
        
        if personal_info.get('summary'):
            story.append(Paragraph("PROFILE", styles['ModernHeading']))
            story.append(Paragraph(personal_info.get('summary'), styles['ModernBody']))
            story.append(Spacer(1, 15))
        
        if experience:
            story.append(Paragraph("EXPERIENCE", styles['ModernHeading']))
            for exp in experience:
                story.append(Paragraph(f"<b>{exp.get('position', '')}</b> - {exp.get('company', '')}", styles['ModernBody']))
                story.append(Paragraph(f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present')} | {exp.get('location', '')}", styles['ModernBody']))
                story.append(Paragraph(exp.get('description', ''), styles['ModernBody']))
                story.append(Spacer(1, 10))
            story.append(Spacer(1, 15))
        
        if education:
            story.append(Paragraph("EDUCATION", styles['ModernHeading']))
            for edu in education:
                story.append(Paragraph(f"<b>{edu.get('degree', '')}</b> - {edu.get('institution', '')}", styles['ModernBody']))
                story.append(Paragraph(f"{edu.get('graduation_year', '')} | {edu.get('location', '')}", styles['ModernBody']))
                if edu.get('gpa'):
                    story.append(Paragraph(f"GPA: {edu.get('gpa')}", styles['ModernBody']))
                story.append(Spacer(1, 10))
            story.append(Spacer(1, 15))
        
        if skills:
            story.append(Paragraph("SKILLS", styles['ModernHeading']))
            skills_text = " • ".join([skill.get('name', '') for skill in skills])
            story.append(Paragraph(skills_text, styles['ModernBody']))
            story.append(Spacer(1, 15))
        
        if projects:
            story.append(Paragraph("PROJECTS", styles['ModernHeading']))
            for project in projects:
                story.append(Paragraph(f"<b>{project.get('name', '')}</b>", styles['ModernBody']))
                story.append(Paragraph(project.get('description', ''), styles['ModernBody']))
                if project.get('technologies'):
                    story.append(Paragraph(f"Technologies: {', '.join(project.get('technologies', []))}", styles['ModernBody']))
                story.append(Spacer(1, 10))
        
        doc.build(story)
        return doc

    def generate_professional_resume(self, buffer, personal_info, education, experience, skills, projects):
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                               rightMargin=50, leftMargin=50,
                               topMargin=50, bottomMargin=20)

        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='ProfessionalTitle', fontSize=20, textColor=colors.black, spaceAfter=20, alignment=1))
        styles.add(ParagraphStyle(name='ProfessionalHeading', fontSize=12, textColor=colors.black, spaceBefore=12, spaceAfter=8, underlineWidth=1))
        styles.add(ParagraphStyle(name='ProfessionalBody', fontSize=10, spaceAfter=4))
        
        story = []

        # Header
        story.append(Paragraph(personal_info.get('name', '').upper(), styles['ProfessionalTitle']))
        story.append(Paragraph(personal_info.get('title', ''), styles['ProfessionalBody']))
        story.append(Paragraph(f"{personal_info.get('email', '')} | {personal_info.get('phone', '')} | {personal_info.get('location', '')}", styles['ProfessionalBody']))
        story.append(Spacer(1, 15))

        # Summary
        if personal_info.get('summary'):
            story.append(Paragraph("Professional Summary", styles['ProfessionalHeading']))
            story.append(Paragraph(personal_info.get('summary'), styles['ProfessionalBody']))
            story.append(Spacer(1, 10))
        
        # Experience
        if experience:
            story.append(Paragraph("Work Experience", styles['ProfessionalHeading']))
            for exp in experience:
                story.append(Paragraph(f"<b>{exp.get('position', '')}</b> - {exp.get('company', '')}", styles['ProfessionalBody']))
                story.append(Paragraph(f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present')} | {exp.get('location', '')}", styles['ProfessionalBody']))
                story.append(Paragraph(exp.get('description', ''), styles['ProfessionalBody']))
                story.append(Spacer(1, 8))
        
        # Education
        if education:
            story.append(Paragraph("Education", styles['ProfessionalHeading']))
            for edu in education:
                story.append(Paragraph(f"<b>{edu.get('degree', '')}</b> - {edu.get('institution', '')}", styles['ProfessionalBody']))
                story.append(Paragraph(f"{edu.get('graduation_year', '')} | {edu.get('location', '')}", styles['ProfessionalBody']))
                if edu.get('gpa'):
                    story.append(Paragraph(f"GPA: {edu.get('gpa')}", styles['ProfessionalBody']))
                story.append(Spacer(1, 8))

        # Skills
        if skills:
            story.append(Paragraph("Key Skills", styles['ProfessionalHeading']))
            skills_text = ", ".join([skill.get('name', '') for skill in skills])
            story.append(Paragraph(skills_text, styles['ProfessionalBody']))
            story.append(Spacer(1, 10))

        # Projects
        if projects:
            story.append(Paragraph("Projects", styles['ProfessionalHeading']))
            for project in projects:
                story.append(Paragraph(f"<b>{project.get('name', '')}</b>", styles['ProfessionalBody']))
                story.append(Paragraph(project.get('description', ''), styles['ProfessionalBody']))
                if project.get('technologies'):
                    story.append(Paragraph(f"Technologies: {', '.join(project.get('technologies', []))}", styles['ProfessionalBody']))
                story.append(Spacer(1, 8))

        doc.build(story)
        return doc

    def generate_creative_resume(self, buffer, personal_info, education, experience, skills, projects):
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                               rightMargin=40, leftMargin=40,
                               topMargin=60, bottomMargin=30)

        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='CreativeTitle', fontSize=26, textColor=colors.HexColor('#E11D48'), spaceAfter=25))
        styles.add(ParagraphStyle(name='CreativeHeading', fontSize=16, textColor=colors.HexColor('#0F766E'), spaceAfter=10))
        styles.add(ParagraphStyle(name='CreativeBody', fontSize=11, spaceAfter=6))
        
        story = []

        # Header with splash color
        story.append(Paragraph(f"<b>{personal_info.get('name', '')}</b>", styles['CreativeTitle']))
        story.append(Paragraph(f"<i>{personal_info.get('title', '')}</i>", styles['CreativeBody']))
        story.append(Paragraph(f"{personal_info.get('email', '')} | {personal_info.get('phone', '')} | {personal_info.get('location', '')}", styles['CreativeBody']))
        story.append(Spacer(1, 20))

        # Summary
        if personal_info.get('summary'):
            story.append(Paragraph("ABOUT ME", styles['CreativeHeading']))
            story.append(Paragraph(personal_info.get('summary'), styles['CreativeBody']))
            story.append(Spacer(1, 10))

        # Experience
        if experience:
            story.append(Paragraph("MY EXPERIENCE", styles['CreativeHeading']))
            for exp in experience:
                story.append(Paragraph(f"<b>{exp.get('position', '')}</b> - {exp.get('company', '')}", styles['CreativeBody']))
                story.append(Paragraph(f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present')} | {exp.get('location', '')}", styles['CreativeBody']))
                story.append(Paragraph(exp.get('description', ''), styles['CreativeBody']))
                story.append(Spacer(1, 8))

        # Education
        if education:
            story.append(Paragraph("EDUCATION JOURNEY", styles['CreativeHeading']))
            for edu in education:
                story.append(Paragraph(f"<b>{edu.get('degree', '')}</b> - {edu.get('institution', '')}", styles['CreativeBody']))
                story.append(Paragraph(f"{edu.get('graduation_year', '')} | {edu.get('location', '')}", styles['CreativeBody']))
                if edu.get('gpa'):
                    story.append(Paragraph(f"GPA: {edu.get('gpa')}", styles['CreativeBody']))
                story.append(Spacer(1, 8))

        # Skills
        if skills:
            story.append(Paragraph("MY SKILLS", styles['CreativeHeading']))
            skills_text = " 🎯 ".join([skill.get('name', '') for skill in skills])
            story.append(Paragraph(skills_text, styles['CreativeBody']))
            story.append(Spacer(1, 10))

        # Projects
        if projects:
            story.append(Paragraph("PROJECTS SHOWCASE", styles['CreativeHeading']))
            for project in projects:
                story.append(Paragraph(f"<b>{project.get('name', '')}</b>", styles['CreativeBody']))
                story.append(Paragraph(project.get('description', ''), styles['CreativeBody']))
                if project.get('technologies'):
                    story.append(Paragraph(f"Tech Used: {', '.join(project.get('technologies', []))}", styles['CreativeBody']))
                story.append(Spacer(1, 8))

        doc.build(story)
        return doc
