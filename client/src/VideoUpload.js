import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';
import './VideoUpload.css';

function VideoUpload() {
    const [video, setVideo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
    const [showConvertButton, setShowConvertButton] = useState(false);
    const [videoDisplayUrl, setVideoDisplayUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVideoChange = (event) => {
        setVideo(event.target.files[0]);
        setUploadProgress(0);
        setUploadedVideoUrl('');
        setShowConvertButton(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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
        }
    };

    const handleConvertClick = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:8000/convert_to_portrait/',
                { video_url: uploadedVideoUrl },
                { withCredentials: false }
            );
            const convertedVideoUrl = response.data.converted_video_url;
            console.log("Converted Video URL:", response.data.converted_video_url);
            setVideoDisplayUrl(convertedVideoUrl);
            setLoading(false);
        } catch (error) {
            console.error('Error converting video:', error);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">Upload a Video</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="videoInput" className="form-label">Video file</label>
                                    <input type="file" className="form-control" id="videoInput" accept="video/*" onChange={handleVideoChange} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Upload Video</button>
                            </form>
                        </div>
                    </div>
                    {loading && (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Converting...</span>
                            </Spinner>
                        </div>
                    )}
                    {uploadProgress > 0 && (
                        <div className="progress mt-3">
                            <div className="progress-bar" role="progressbar" style={{ width: `${uploadProgress}%` }} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">{uploadProgress}%</div>
                        </div>
                    )}
                    {uploadedVideoUrl && (
                        <div>
                            <VideoPlayer videoUrl={videoDisplayUrl || uploadedVideoUrl} />
                            {showConvertButton && (
                                <button className="btn btn-secondary mt-3" onClick={handleConvertClick}>Convert to Portrait (9:16)</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoUpload;
