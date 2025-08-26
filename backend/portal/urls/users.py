from django.urls import path
from ..views import DeveloperResumeDownloadView


urlpatterns = [
    path('me/download-resume/', DeveloperResumeDownloadView.as_view(), name='developer-resume-download'),
]
