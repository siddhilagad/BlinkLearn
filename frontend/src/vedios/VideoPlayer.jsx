import React, { useState, useRef } from "react";
import "./VideoPlayer.css";
import { FaPlay, FaPause, FaExpand, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

function VideoPlayer({ videoUrl, thumbnail }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div
      className="video-player-wrapper"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Thumbnail overlay before play */}
      {!playing && thumbnail && progress === 0 && (
        <div className="video-thumbnail-overlay" onClick={togglePlay}>
          <img src={thumbnail} alt="Course Preview" />
          <div className="play-overlay-btn">
            <FaPlay />
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        className="video-element"
        style={{ display: !playing && progress === 0 && thumbnail ? "none" : "block" }}
      />

      {/* Controls */}
      {showControls && (
        <div className="video-controls">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="progress-bar"
          />

          <div className="controls-row">
            <button onClick={togglePlay} className="ctrl-btn">
              {playing ? <FaPause /> : <FaPlay />}
            </button>

            <button onClick={toggleMute} className="ctrl-btn">
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            <span className="ctrl-label">Course Preview</span>

            <button onClick={handleFullscreen} className="ctrl-btn ml-auto">
              <FaExpand />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;