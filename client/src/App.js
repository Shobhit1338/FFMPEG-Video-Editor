import React from 'react';
import VideoUpload from './VideoUpload';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <header className="App-header">
        <h1 className="text-uppercase">FFmpeg Video Playground</h1>
      </header>
      <main className="container">
        <VideoUpload />
      </main>
    </div>
  );
}

export default App;
