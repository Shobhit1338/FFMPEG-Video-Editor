import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './VideoUpload.css';
import { Spinner } from 'react-bootstrap';
import ReactPlayer from 'react-player';

function VideoUpload() {
    const [video, setVideo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
    const [videoDisplayUrl, setVideoDisplayUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [brightness, setBrightness] = useState(1);
    const [filter, setFilter] = useState('');
    const [cacheBuster, setCacheBuster] = useState(0)



    const handleVideoChange = (event) => {
        setVideo(event.target.files[0]);
        setUploadProgress(0);
        setUploadedVideoUrl('');
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
            console.log(response.data);
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
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/extract_audio/', { video_url: uploadedVideoUrl });
            if (response.status === 200 && response.data.audio_url) {
                setAudioUrl(response.data.audio_url);
            } else {
                console.error('Audio extraction was not successful.', response.data);
            }
        } catch (error) {
            console.error('Error extracting audio:', error);
        } finally {
            setLoading(false);
        }
    };    

    const applyEffects = async () => {
        setLoading(true);
        try {
          const response = await axios.post('http://localhost:8000/api/apply-effects', {
            videoUrl: uploadedVideoUrl,
            brightness,
            filter
          });
          const fullVideoUrl = `http://localhost:8000${response.data.convertedVideoUrl}`;
          setVideoDisplayUrl(fullVideoUrl);
          setCacheBuster(prev => prev + 1);
        } catch (error) {
          console.error('Error applying effects:', error);
        } finally {
            setLoading(false);
        }
      };
      
      

      return (
        <div className="video-playground">
            <main className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Upload and Convert Your Video</h2>
                                <form onSubmit={handleSubmit} className="upload-form">
                                    <div className="input-group mb-3">
                                        <input type="file" className="form-control" id="videoInput" accept="video/*" onChange={handleVideoChange} required />
                                        <button className="btn btn-primary upload-btn" type="submit">Upload Video</button>
                                    </div>
                                    {loading && <div className="spinner-container mt-3"><Spinner animation="border" variant="primary" /></div>}
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="progress mt-3">
                                            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${uploadProgress}%` }} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
                                                {uploadProgress}%
                                            </div>
                                        </div>
                                    )}
                                </form>
                                {uploadedVideoUrl && (
                                    <>
                                        <VideoPlayer videoUrl={`${videoDisplayUrl || uploadedVideoUrl}?cb=${cacheBuster}`} />
                                    </>
                                )}
                                {audioUrl && (
                                    <div className="audio-player-container mt-3">
                                        <ReactPlayer url={audioUrl} width="100%" height="50px" controls={true} />
                                        <a href={audioUrl} download="downloaded_audio.mp3" className="btn btn-primary mt-3">Download Audio</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {uploadedVideoUrl && (
                        <div className="col-lg-4">
                            <div className="card">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Apply Effects</h2><hr></hr>
                                <div className="effect mt-3">
                                    <p>Set Brightness:</p>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0.1"
                                        max="2"
                                        step="0.1"
                                        value={brightness}
                                        onChange={(e) => setBrightness(e.target.value)}
                                    />
                                    <div className="slider-value">{brightness}</div>
                                    <select className="form-select mt-3" onChange={(e) => setFilter(e.target.value)}>
                                        <option value="">Select a Filter</option>
                                        <option value="vignette">Vignette</option>
                                    </select>
                                    <button className="btn btn-primary mt-3" onClick={applyEffects}>Apply Effects</button>
                                </div>
                            </div>
                            </div>
                            <div className="card mt-4">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Actions</h2><hr></hr>
                                    <div className="effect mt-3">
                                        <button className="btn btn-secondary" onClick={handleConvertClick}>Convert to Portrait</button>
                                        <button className="btn btn-secondary ms-2" onClick={handleExtractAudio}>Extract Audio</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer className="footer py-3 bg-secondary text-white text-center">
                <p>© 2024 FFmpeg Video Playground. All rights reserved.</p>
            </footer>
        </div>
    );    
}    

export default VideoUpload;
