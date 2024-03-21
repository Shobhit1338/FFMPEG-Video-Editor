import React from 'react';
import VideoUpload from './VideoUpload';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Import custom styles

function App() {
  return (
    <div className="App">
      <header className="App-header text-center py-3 mb-5">
        <h1>Video Converter</h1>
      </header>
      <main className="container">
        <VideoUpload />
      </main>
    </div>
  );
}

export default App;
