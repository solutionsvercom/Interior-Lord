function ProjectArrow() {
  return (
    <span className="project-arrow">
      <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    </span>
  );
}

export default function WorkPanel({ active, studio, projects, activeIndex, onHover, onSelect }) {
  return (
    <div className={active ? 'panel panel-active' : 'panel'} id="panel-work">
      <div className="panel-header">
        <span>{studio.workLabel}</span>
      </div>
      <ul className="project-list" id="projectList">
        {projects.map((project) => (
          <li
            key={project.number}
            className={activeIndex === project.order ? 'project-item active' : 'project-item'}
            data-index={project.order}
            onMouseEnter={() => onHover(project.order)}
          >
            <a href="#" className="project-link" onClick={(e) => onSelect(e, project.order)}>
              <span className="project-number">{project.number}</span>
              <span className="project-title">{project.title}</span>
              <ProjectArrow />
              <span className="project-category">{project.category}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="panel-footer">
        <span>{projects.length} {studio.workCountLabel || 'Projects'}</span>
        <span className="preview-hint-desktop">{studio.hoverHint}</span>
        <span className="preview-hint-mobile">Tap to Preview</span>
      </div>
    </div>
  );
}
