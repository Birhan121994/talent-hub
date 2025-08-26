from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('portal.urls.auth')),
    path('api/jobs/', include('portal.urls.jobs')),
    path('api/applications/', include('portal.urls.applications')),
    path('api/users/', include('portal.urls.users')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)