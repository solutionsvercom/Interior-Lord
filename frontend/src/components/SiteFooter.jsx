export default function SiteFooter({ studio }) {
  return (
    <footer className="site-footer">
      <span>{studio.footerCopy}</span>
      <div className="footer-links">
        <a href={studio.privacyHref} target="_blank" rel="noreferrer">{studio.privacyLabel || 'Privacy'}</a>
        <span className="footer-dot">&middot;</span>
        <a href={studio.termsHref}>{studio.termsLabel || 'Terms'}</a>
        <span className="footer-dot">&middot;</span>
        <a href={studio.creditHref} target="_blank" rel="noreferrer">{studio.creditLabel}</a>
      </div>
    </footer>
  );
}
