import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="ServiceHub home">
          <span className="brand-mark" aria-hidden="true">
            ⌂
          </span>
          ServiceHub
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/user/bookings">My bookings</Link>
        </nav>

        <div className="nav-actions">
          <Link className="button button-secondary" href="/login">
            Log in
          </Link>
          <Link className="button" href="/register">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}