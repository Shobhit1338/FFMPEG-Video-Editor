"""
URL configuration for video_converter_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from video_processor import views

urlpatterns = [
    path('media/uploads/<str:filename>', views.serve_protected_document, name='serve_protected_document'),
    path('convert_to_portrait/', views.convert_to_portrait, name='convert_to_portrait'),
    path('conversion_progress/', views.conversion_progress, name='conversion_progress'),
    path('upload/', views.upload_video, name='upload_video'),
    path('extract_audio/', views.extract_audio, name='extract_audio'),
    path('api/apply-effects', views.apply_effects, name='apply_effects'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)