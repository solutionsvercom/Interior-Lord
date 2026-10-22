import { useEffect, useState } from 'react';
import { mediaSrc } from '../content';

function projectShow(project) {
  if (Array.isArray(project.show) && project.show.length) {
    return project.show
      .filter((item) => item && item.src)
      .map((item) => ({ kind: item.kind === 'video' ? 'video' : 'image', src: item.src }));
  }
  const images = Array.isArray(project.images) && project.images.length
    ? project.images
    : (project.image ? [project.image] : []);
  return images.map((src) => ({ kind: 'image', src }));
}

function MediaShow({ project, active }) {
  const frames = projectShow(project);
  const [frame, setFrame] = useState(0);
  const current = frames[frame] || frames[0];
  const frameCount = frames.length;
  const currentKind = current ? current.kind : '';
  const currentSrc = current ? current.src : '';

  useEffect(() => {
    if (!active) {
      setFrame(0);
      return undefined;
    }
    if (!currentSrc || frameCount < 2 || currentKind === 'video') return undefined;
    const timer = setTimeout(() => {
      setFrame((index) => (index + 1) % frameCount);
    }, 3800);
    return () => clearTimeout(timer);
  }, [active, currentKind, currentSrc, frameCount]);

  if (!current) return null;

  const label = frames.length > 1
    ? `${project.category} — ${project.year} · ${String(frame + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`
    : `${project.category} — ${project.year}`;
  const next = () => setFrame((index) => (index + 1) % frames.length);

  return (
    <>
      {current.kind === 'video' && active ? (
        <video
          key={current.src}
          className="show-frame active"
          src={mediaSrc(current.src)}
          autoPlay
          muted
          playsInline
          onEnded={next}
          onError={next}
        />
      ) : current.kind === 'video' ? null : (
        <img
          key={current.src}
          className="show-frame active"
          src={mediaSrc(current.src)}
          alt={`${project.title} ${frame + 1}`}
          loading="eager"
        />
      )}
      <div className="canvas-caption">
        <div className="canvas-caption-title">{project.title}</div>
        <div className="canvas-caption-year">{label}</div>
      </div>
    </>
  );
}

export default function Canvas({ studio, projects, panel, slide, contextVisible, slideRefs }) {
  const placeholderHidden = panel !== 'work' || slide >= 0;

  return (
    <div className="canvas-side" id="canvasSide">
      <div className={placeholderHidden ? 'canvas-placeholder hidden' : 'canvas-placeholder'} id="placeholder">
        <div className="placeholder-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m-10-10h4m12 0h4m-3.3-6.7-2.8 2.8m-5.8 5.8-2.8 2.8m0-11.3 2.8 2.8m5.8 5.8 2.8 2.8" />
          </svg>
        </div>
        <span className="placeholder-text">{studio.canvasHint || 'Select a project'}</span>
      </div>

      {projects.map((project) => {
        const active = panel === 'work' && slide === project.order;
        const frames = projectShow(project);
        const useShow = frames.length > 1;
        return (
          <div
            key={project.number}
            className={active ? 'canvas-image visible' : 'canvas-image'}
            data-slide={project.order}
            ref={(node) => { slideRefs.current[project.order] = node; }}
          >
            {useShow ? (
              <MediaShow project={project} active={active} />
            ) : project.video && active ? (
              <video src={project.video} poster={mediaSrc(project.image)} autoPlay muted loop playsInline />
            ) : (
              <img src={mediaSrc(project.image)} alt={project.title} loading="lazy" />
            )}
            {useShow ? null : (
              <div className="canvas-caption">
                <div className="canvas-caption-title">{project.title}</div>
                <div className="canvas-caption-year">{project.category} — {project.year}</div>
              </div>
            )}
          </div>
        );
      })}

      <div className={panel === 'about' && contextVisible ? 'canvas-context visible' : 'canvas-context'} data-context="about">
        <img src={mediaSrc(studio.aboutImage)} alt="Studio" loading="lazy" />
        <div className="canvas-context-overlay">
          <p className="canvas-context-quote">{studio.aboutQuote}</p>
          <span className="canvas-context-attr">{studio.aboutAttr}</span>
        </div>
      </div>

      <div className={panel === 'contact' && contextVisible ? 'canvas-context visible' : 'canvas-context'} data-context="contact">
        <img src={mediaSrc(studio.contactImage)} alt="Contact" loading="lazy" />
        <div className="canvas-context-overlay">
          <p className="canvas-context-quote">{studio.contactQuote}</p>
          <span className="canvas-context-attr">{studio.contactAttr}</span>
        </div>
      </div>
    </div>
  );
}
