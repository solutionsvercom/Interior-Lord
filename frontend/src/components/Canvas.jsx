import { mediaSrc } from '../content';

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

      {projects.map((project) => (
        <div
          key={project.number}
          className={panel === 'work' && slide === project.order ? 'canvas-image visible' : 'canvas-image'}
          data-slide={project.order}
          ref={(node) => { slideRefs.current[project.order] = node; }}
        >
          {project.video && panel === 'work' && slide === project.order ? (
            <video src={project.video} poster={mediaSrc(project.image)} autoPlay muted loop playsInline />
          ) : (
            <img src={mediaSrc(project.image)} alt={project.title} loading="lazy" />
          )}
          <div className="canvas-caption">
            <div className="canvas-caption-title">{project.title}</div>
            <div className="canvas-caption-year">{project.category} — {project.year}</div>
          </div>
        </div>
      ))}

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
