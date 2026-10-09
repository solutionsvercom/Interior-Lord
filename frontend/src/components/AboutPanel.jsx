export default function AboutPanel({ active, studio }) {
  return (
    <div className={active ? 'panel panel-active' : 'panel'} id="panel-about">
      <div className="about-content">
        <span className="about-label">{studio.aboutLabel}</span>
        <h2 className="about-headline">
          {studio.aboutHeadlineBefore}<em>{studio.aboutHeadlineEm}</em>{studio.aboutHeadlineAfter}
        </h2>
        <p className="about-body">{studio.aboutBody}</p>
        <div className="about-stats">
          {studio.stats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
