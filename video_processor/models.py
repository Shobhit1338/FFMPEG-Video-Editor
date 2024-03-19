from django.db import models

from django.db import models

class UploadedVideo(models.Model):
    video = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)