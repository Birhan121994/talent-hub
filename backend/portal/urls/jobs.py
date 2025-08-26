from django.urls import path
from ..views import JobListView, JobDetailView, JobRecommendationsView

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('recommendations/', JobRecommendationsView.as_view(), name='job-recommendations'),
]