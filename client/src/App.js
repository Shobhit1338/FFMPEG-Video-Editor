import React, { useState } from 'react';
import VideoUpload from './VideoUpload';
import GreenScreen from './GreenScreen';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('upload'); // State to track the current page

  // Function to switch between pages
  const switchPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App d-flex flex-column min-vh-100 justify-content-center align-items-center">
      <header className="App-header">
        <h1 className="text-uppercase">FFmpeg Video Playground</h1>
      </header>
      <main className="container">
      <div className="btn-group" role="group" aria-label="Pages">
        {currentPage !== 'upload' && (
          <button className="btn btn-primary" onClick={() => switchPage('upload')}>
            Upload Video
          </button>
        )}
        {currentPage !== 'green-screen' && (
          <button className="btn btn-primary" onClick={() => switchPage('green-screen')}>
            Green Screen
          </button>
        )}
      </div>
        {/* Conditional rendering based on the current page */}
        {currentPage === 'upload' && <VideoUpload />}
        {currentPage === 'green-screen' && <GreenScreen />}
      </main>
    </div>
  );
}

export default App;
