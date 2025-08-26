from django.urls import path
from ..views import RegisterView, LoginView, ResumeUploadView, UserDetailView, ResumeGenerateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('resume/', ResumeUploadView.as_view(), name='resume-upload'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('generate-resume/', ResumeGenerateView.as_view(), name='generate-resume'),
]