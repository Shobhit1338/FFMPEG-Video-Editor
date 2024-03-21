import React from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

function VideoPlayer({ videoUrl }) {
    return (
        <div className='player-wrapper d-flex justify-content-center my-4'>
            <ReactPlayer url={videoUrl} controls={true} width='100%' height='100%' className="react-player" />
        </div>
    );
}

export default VideoPlayer;
