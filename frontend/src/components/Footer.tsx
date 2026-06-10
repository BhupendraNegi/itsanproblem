export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">it&apos;s an problem.</span>
        <nav className="app-footer-links">
          <a href="#about">About</a>
          <a href="#help">Help</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </nav>
        <p className="app-footer-copy">
          © {new Date().getFullYear()} it&apos;s an problem — anonymous by design.
        </p>
      </div>
    </footer>
  )
}
