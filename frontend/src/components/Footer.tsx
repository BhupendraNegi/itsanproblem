import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">it&apos;s an problem.</span>
        <nav className="app-footer-links">
          <Link to="/about">About</Link>
          <Link to="/help">Help</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p className="app-footer-copy">
          © {new Date().getFullYear()} it&apos;s an problem — anonymous by design.
        </p>
      </div>
    </footer>
  )
}
