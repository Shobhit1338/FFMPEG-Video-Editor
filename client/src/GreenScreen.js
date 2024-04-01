import React, { useState } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import VideoPlayer from './VideoPlayer';

function GreenScreen() {
  const [baseVideo, setBaseVideo] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [uploadProgressBase, setUploadProgressBase] = useState(0);
  const [uploadProgressOverlay, setUploadProgressOverlay] = useState(0);
  const [baseVideoUrl, setBaseVideoUrl] = useState('');
  const [overlayImageUrl, setOverlayImageUrl] = useState('');
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState('');

  const handleBaseVideoChange = (event) => {
    setBaseVideo(event.target.files[0]);
    setUploadProgressBase(0);
    setBaseVideoUrl('');
  };

  const handleOverlayImageChange = (event) => {
    setOverlayImage(event.target.files[0]);
    setUploadProgressOverlay(0);
    setOverlayImageUrl('');
  };

  const handleSubmitBase = async (event) => {
    event.preventDefault();
    setLoadingBase(true);
    const formData = new FormData();
    formData.append('video', baseVideo);
    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgressBase(percentCompleted);
        },
      });
      setBaseVideoUrl(response.data.video_url);
    } catch (error) {
      console.error('Error uploading base video:', error);
    } finally {
      setLoadingBase(false);
    }
  };

  const handleSubmitOverlay = async (event) => {
    event.preventDefault();
    setLoadingOverlay(true);
    const formData = new FormData();
    formData.append('image', overlayImage);
    try {
      const response = await axios.post('http://localhost:8000/upload_image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgressOverlay(percentCompleted);
        },
      });
      setOverlayImageUrl(response.data.image_url);
    } catch (error) {
      console.error('Error uploading overlay image:', error);
    } finally {
      setLoadingOverlay(false);
    }
  };

  const handleDoMagic = async () => {
    try {
      const response = await axios.post('http://localhost:8000/do_magic/', {
        base_video_url: baseVideoUrl,
        overlay_image_url: overlayImageUrl,
      });
      setResultVideoUrl(response.data.result_video_url);
      setShowResult(true);
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <h2 className="mb-4">Base Video</h2>
          <form onSubmit={handleSubmitBase}>
            <div className="mb-3">
              <input type="file" className="form-control" accept="video/*" onChange={handleBaseVideoChange} required />
            </div>
            <button type="submit" className="btn btn-primary mb-3" disabled={loadingBase}>Upload Base Video</button>
            {loadingBase && <Spinner animation="border" variant="primary" />}
            {!loadingBase && uploadProgressBase > 0 && <div className="progress mb-3"><div className="progress-bar bg-primary" role="progressbar" style={{ width: `${uploadProgressBase}%` }}>{uploadProgressBase}%</div></div>}
          </form>
          {baseVideoUrl && <VideoPlayer videoUrl={baseVideoUrl} />}
        </div>
        <div className="col-md-6">
          <h2 className="mb-4">Overlay Image</h2>
          <form onSubmit={handleSubmitOverlay}>
            <div className="mb-3">
              <input type="file" className="form-control" accept="image/*" onChange={handleOverlayImageChange} required />
            </div>
            <button type="submit" className="btn btn-primary mb-3" disabled={loadingOverlay}>Upload Overlay Image</button>
            {loadingOverlay && <Spinner animation="border" variant="primary" />}
            {!loadingOverlay && uploadProgressOverlay > 0 && <div className="progress mb-3"><div className="progress-bar bg-primary" role="progressbar" style={{ width: `${uploadProgressOverlay}%` }}>{uploadProgressOverlay}%</div></div>}
          </form>
          {overlayImageUrl && <img src={overlayImageUrl} alt="Overlay" className="img-fluid" />}
        </div>
      </div>
      <div className="text-center mt-5">
        <button className="btn btn-primary" onClick={handleDoMagic}>Do the Magic</button>
      </div>
      {showResult && (
        <div className="text-center mt-5">
          <h2>Result Video</h2>
          <VideoPlayer videoUrl={resultVideoUrl} />
        </div>
      )}
    </div>
  );
}

export default GreenScreen;
