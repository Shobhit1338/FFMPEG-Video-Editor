from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UploadedVideo
from django.http import HttpResponse
from django.conf import settings
import mimetypes
import os
import json
import subprocess


@csrf_exempt
def upload_video(request):
    if request.method == 'POST':
        video_file = request.FILES.get('video')
        if video_file:
            new_filename = "gence-video" + os.path.splitext(video_file.name)[1] 
            video = UploadedVideo(video=video_file)
            video.video.name = new_filename
            video.save()
            video_url = request.build_absolute_uri(f'/media/uploads/{new_filename}')
            return JsonResponse({'message': 'Video uploaded successfully!', 'video_url': video_url, 'filename': new_filename}, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

def serve_protected_document(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            mime_type, _ = mimetypes.guess_type(file_path)
            response = HttpResponse(fh.read(), content_type=mime_type)
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
            return response
    raise Http404

@csrf_exempt
def convert_to_portrait(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        video_url = data.get('video_url')
        video_name = os.path.basename(video_url)
        output_video_path = os.path.join(settings.MEDIA_ROOT, 'uploads', f'ffmpeg-{video_name}')
        try:
            output_video_name = f'ffmpeg-{video_name}'
            output_video_url = request.build_absolute_uri(settings.MEDIA_URL + 'uploads/' + output_video_name)
            process = subprocess.Popen(
                ['ffmpeg', '-i', video_url, '-vf', "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:-1:-1:color=black", '-c:a', 'copy', output_video_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            while True:
                output = process.stderr.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    print(output.strip())

            rc = process.poll()
            print('Video converted successfully!!!!!')
            return JsonResponse({'message': 'Video converted successfully', 'converted_video_url': output_video_url}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def conversion_progress(request):
    # Logic to fetch and return conversion progress
    # This could involve querying a database or some other method to get the progress
    progress = 50  # For example, set progress to 50% (you need to update this with your actual logic)

    return JsonResponse({'progress': progress})