export default function SiteHeader({ studio, panel, onNavigate }) {
  return (
    <header className="site-header">
      <div className="site-brand">
        <a className="site-title" data-nav="work" onClick={(e) => { e.preventDefault(); onNavigate('work'); }}>
          {studio.brandMark || studio.brand}
          {studio.brandAccent ? <span className="site-title-accent">{studio.brandAccent}</span> : null}
        </a>
        <div className="site-divider-v"></div>
        <span className="site-tagline">{studio.tagline}</span>
      </div>
      <nav className="site-header-nav">
        <a data-nav="work" className={panel === 'work' ? 'nav-active' : undefined} onClick={(e) => { e.preventDefault(); onNavigate('work'); }}>Work</a>
        <a data-nav="about" className={panel === 'about' ? 'nav-active' : undefined} onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>About</a>
        <a data-nav="contact" className={panel === 'contact' ? 'nav-active' : undefined} onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>Contact</a>
      </nav>
    </header>
  );
}
