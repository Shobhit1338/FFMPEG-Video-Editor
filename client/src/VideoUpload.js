import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VideoUpload.css';
import { Spinner } from 'react-bootstrap';

function VideoUpload() {
    const [video, setVideo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
    const [showConvertButton, setShowConvertButton] = useState(false);
    const [videoDisplayUrl, setVideoDisplayUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');


    const handleVideoChange = (event) => {
        setVideo(event.target.files[0]);
        setUploadProgress(0);
        setUploadedVideoUrl('');
        setShowConvertButton(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('video', video);
        try {
            const response = await axios.post('http://localhost:8000/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            setUploadedVideoUrl(response.data.video_url);
            setShowConvertButton(true);
        } catch (error) {
            console.error('Error uploading video:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvertClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:8000/convert_to_portrait/',
                { video_url: uploadedVideoUrl },
                { withCredentials: false }
            );
            setVideoDisplayUrl(response.data.converted_video_url);
        } catch (error) {
            console.error('Error converting video:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExtractAudio = async () => {
        setLoading(true); // Start loading state
        try {
            const response = await axios.post(
                'http://localhost:8000/extract_audio/',
                { video_url: uploadedVideoUrl }, // Ensure uploadedVideoUrl is the correct path or URL to the video
                { withCredentials: false }
            );
    
            // Check for a successful extraction by inspecting the response
            if (response.status === 200 && response.data.audio_url) {
                setAudioUrl(response.data.audio_url); // Set the audio URL for playback/download
            } else {
                // Handle cases where the extraction might not have returned an error, but also didn't succeed
                console.error('Audio extraction was not successful.', response.data);
            }
        } catch (error) {
            console.error('Error extracting audio:', error);
            // Optionally, update the UI to inform the user an error occurred
        } finally {
            setLoading(false); // End loading state regardless of outcome
        }
    };
      

    return (
        <div className="upload-container d-flex align-items-center justify-content-center py-5">
            <div className="upload-card text-center p-5">
                <h2 className="upload-title mb-4">Upload and Convert Your Video</h2>
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="input-group mb-3 justify-content-center">
                        <input type="file" className="form-control text-center" id="videoInput" accept="video/*" onChange={handleVideoChange} required style={{marginBottom: '1rem'}} />
                        <div className="w-100 d-flex justify-content-center">
                            <button className="btn upload-btn" type="submit">Upload Video</button>
                        </div>
                    </div>
                    {loading && <div className="spinner-container mt-3"><Spinner animation="border" variant="light" /></div>}
                    {uploadProgress > 0 && !loading && (
                        <div className="progress mt-3" style={{height: '30px'}}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress}%` }} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
                                {uploadProgress}%
                            </div>
                        </div>
                    )}
                </form>
                {uploadedVideoUrl && (
                            <>
                        <VideoPlayer videoUrl={videoDisplayUrl || uploadedVideoUrl} />
                        <div className="video-controls">
                            {showConvertButton && (
                                <button className="btn btn-secondary mt-3" onClick={handleConvertClick}>Convert to Portrait</button>
                            )}
                            <button className="btn btn-secondary mt-3" onClick={handleExtractAudio}>Extract Audio</button>
                        </div>
                    </>
                )}
                {audioUrl && (
                    <div className="audio-player-container">
                        <audio controls src={audioUrl} className="mt-3"></audio>
                        <a href={audioUrl} download className="btn btn-success mt-3">Download Audio</a>
                    </div>
                )}
            </div>
        </div>
    );    
}

export default VideoUpload;
