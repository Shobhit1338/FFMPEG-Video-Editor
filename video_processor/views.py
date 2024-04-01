from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UploadedVideo, UploadedImage
from django.http import HttpResponse
# from video_converter_project import settings
from django.conf import settings
import mimetypes
import os
import json
from urllib.parse import urlparse
import subprocess
import os.path
from django.shortcuts import render
@csrf_exempt
def upload_video(request):
    if request.method == 'POST':
        video_file = request.FILES.get('video')
        if video_file:
            video = UploadedVideo(video=video_file)
            video.save()
            video_url = request.build_absolute_uri(f'/media/{video.video.name}')
            return JsonResponse({'message': 'Video uploaded successfully!', 'video_url': video_url, 'filename': video.video.name}, status=201)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        image_file = request.FILES.get('image')
        if image_file:
            image = UploadedImage(image=image_file)
            image.save()
            image_url = request.build_absolute_uri(f'/media/{image.image.name}')
            return JsonResponse({'message': 'Image uploaded successfully!', 'image_url': image_url, 'filename': image.image.name}, status=201)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def serve_protected_document(request, filename):
    print(filename)
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
        parsed_url = urlparse(video_url)
        filename = os.path.basename(parsed_url.path)

        video_path = os.path.join(settings.MEDIA_ROOT, 'uploads', filename)
        if not os.path.exists(video_path):
            return JsonResponse({'error': 'Video not found'}, status=404)
        
        new_filename = f'ffmpeg-{filename}'
        output_video_path = os.path.join(settings.MEDIA_ROOT, 'uploads', new_filename)
        output_video_url = request.build_absolute_uri(f'/media/uploads/{new_filename}')
        process = subprocess.Popen(
            ['ffmpeg', '-i', video_path, '-vf', "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:-1:-1:color=black", '-c:a', 'copy', output_video_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        stderr_output = process.communicate()[1]

        if process.returncode == 0:
            return JsonResponse({'message': 'Video converted successfully', 'converted_video_url': output_video_url}, status=200)
        else:
            return JsonResponse({'error': stderr_output}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def conversion_progress(request):
    # Logic to fetch and return conversion progress
    # This could involve querying a database or some other method to get the progress
    progress = 50  # For example, set progress to 50% (you need to update this with your actual logic)

    return JsonResponse({'progress': progress})

@csrf_exempt
def extract_audio(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        video_url = data.get('video_url')
        video_path = video_url.replace('http://localhost:8000/media/', str(settings.MEDIA_ROOT) + '/')

        video_name = os.path.basename(video_path)
        base_video_name, _ = os.path.splitext(video_name)
        audio_output_name = f'{base_video_name}.mp3'

        audio_output_path = os.path.join(settings.MEDIA_ROOT, 'audio', audio_output_name)
        audio_output_url = request.build_absolute_uri(settings.MEDIA_URL + 'audio/' + audio_output_name)

        try:
            command = [
                'ffmpeg', '-i', video_path,
                '-vn',
                '-acodec', 'libmp3lame',
                '-q:a', '2',
                audio_output_path
            ]
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stderr_output = []
            while True:
                line = process.stderr.readline()
                if not line and process.poll() is not None:
                    break
                if line:
                    stderr_output.append(line.strip())

            rc = process.poll()
            if rc == 0:
                return JsonResponse({'message': 'Audio extracted successfully', 'audio_url': audio_output_url}, status=200)
            else:
                error_details = "\n".join(stderr_output)
                return JsonResponse({'error': f"Audio extraction failed with code {rc}: {error_details}"}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    
    
@csrf_exempt
def apply_effects(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        video_url = data.get('videoUrl')
        video_name = os.path.basename(video_url)
        video_name_without_domain = video_name.split('/')[-1]
        
        base_video_name, _ = os.path.splitext(video_name_without_domain)
        output_video_name = f'filtered-{base_video_name}.mp4'
        output_video_path = os.path.join(settings.MEDIA_ROOT, 'filtered', output_video_name)
        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
        video_path = os.path.join(settings.MEDIA_ROOT, 'uploads', video_name_without_domain)
        
        ffmpeg_cmd = ['ffmpeg', '-i', video_path]
        filter_complex = []
        
        brightness = data.get('brightness', 1)
        if brightness != 1:
            brightness_adjustment = f'eq=brightness={float(brightness) - 1}'
            filter_complex.append(brightness_adjustment)
        
        filter_type = data.get('filter')
        if filter_type == 'vignette':
            filter_complex.append('vignette')
        
        if filter_complex:
            ffmpeg_cmd += ['-vf', ','.join(filter_complex)]
        
        ffmpeg_cmd.append(output_video_path)
        
        try:
            subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            converted_video_url = os.path.join(settings.MEDIA_URL, 'filtered', output_video_name)
            print("converted_video_url: ", converted_video_url)
            return JsonResponse({'message': 'Video converted successfully', 'convertedVideoUrl': converted_video_url}, status=200)
        except subprocess.CalledProcessError as e:
            return JsonResponse({'error': 'Failed to convert video'}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def do_magic(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        base_video_url = data.get('base_video_url')
        overlay_image_url = data.get('overlay_image_url')

        if not base_video_url or not overlay_image_url:
            return JsonResponse({'error': 'Both base video URL and overlay image URL are required.'}, status=400)

        base_video_filename = base_video_url.split('/')[-1]
        overlay_image_filename = overlay_image_url.split('/')[-1]
        base_video_path = os.path.join(settings.MEDIA_ROOT, 'uploads', base_video_filename)
        overlay_image_path = os.path.join(settings.MEDIA_ROOT, 'images', overlay_image_filename)
        output_video_path = os.path.join(settings.MEDIA_ROOT, 'result.mp4')

        try:
            # Step 1: Extract green screen area dimensions from base video
            green_screen_info_command = [
                'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                '-of', 'json', base_video_path
            ]
            green_screen_info_process = subprocess.Popen(green_screen_info_command, stdout=subprocess.PIPE)
            green_screen_info_output, _ = green_screen_info_process.communicate()
            green_screen_info = json.loads(green_screen_info_output)
            width = green_screen_info['streams'][0]['width']
            height = green_screen_info['streams'][0]['height']

            # Step 2: Resize overlay image to match green screen area dimensions
            overlay_resize_command = [
                'ffmpeg', '-i', overlay_image_path,
                '-vf', f'scale={width}:{height}', 'resized_overlay.png'
            ]
            subprocess.run(overlay_resize_command, check=True)

            # Step 3: Overlay resized image onto green screen area
            overlay_command = [
                'ffmpeg', '-i', base_video_path, '-i', 'resized_overlay.png',
                '-filter_complex', f'[1:v]chromakey=0x00FF00:0.1:0.2[ckout];[0:v][ckout]overlay[out]',
                '-map', '[out]', output_video_path
            ]
            subprocess.run(overlay_command, check=True)

            # Return the URL of the resulting video
            result_video_url = os.path.join(settings.MEDIA_URL, 'result.mp4')
            return JsonResponse({'result_video_url': result_video_url}, status=200)

        except subprocess.CalledProcessError as e:
            return JsonResponse({'error': f'Error processing video: {e.stderr.decode()}'}, status=500)

        except Exception as e:
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)