from django.urls import path
from ..views import ApplicationListView, ApplicationDetailView, UserApplicationsView,  ApplicationResumeDownloadView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('user/<int:user_id>/', UserApplicationsView.as_view(), name='user-applications'),
    path('<int:pk>/download-resume/', ApplicationResumeDownloadView.as_view(), name='application-download-resume'),
]