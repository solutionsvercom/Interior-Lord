import { useEffect, useRef, useState } from 'react';

function fitIntroVideo(video) {
  if (!video) return;
  const narrow = window.innerWidth <= 900;
  if (!narrow) {
    video.style.width = '';
    video.style.height = '';
    return;
  }
  const ratio = video.videoWidth && video.videoHeight
    ? video.videoWidth / video.videoHeight
    : 16 / 9;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  let width = screenH * ratio;
  let height = screenH;
  if (width < screenW) {
    width = screenW;
    height = screenW / ratio;
  }
  video.style.width = `${Math.ceil(width)}px`;
  video.style.height = `${Math.ceil(height)}px`;
}

export default function Intro({ studio, onDone }) {
  const videoRef = useRef(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const fit = () => fitIntroVideo(video);
    fit();
    video.muted = true;
    video.play().catch(() => {});
    video.addEventListener('loadedmetadata', fit);
    window.addEventListener('resize', fit);
    return () => {
      video.removeEventListener('loadedmetadata', fit);
      window.removeEventListener('resize', fit);
    };
  }, [studio.introVideo]);

  if (!studio.introVideo) return null;

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const next = !sound;
    video.muted = !next;
    setSound(next);
    video.play().catch(() => {});
  }

  return (
    <div className="intro-screen">
      <video
        ref={videoRef}
        className="intro-video"
        src={studio.introVideo}
        poster={studio.introPoster || undefined}
        autoPlay
        muted
        playsInline
        onEnded={onDone}
      />
      <div className="intro-bar">
        <div className="intro-brand">
          <div className="site-title">
            {studio.brandMark || studio.brand}
            {studio.brandAccent ? <span className="site-title-accent">{studio.brandAccent}</span> : null}
          </div>
          <span className="site-tagline">{studio.tagline}</span>
        </div>
        <div className="intro-actions">
          <button type="button" className="intro-sound" onClick={toggleSound}>
            {sound ? 'Sound on' : 'Sound'}
          </button>
          <button type="button" className="form-submit" onClick={onDone}>Enter</button>
        </div>
      </div>
    </div>
  );
}
