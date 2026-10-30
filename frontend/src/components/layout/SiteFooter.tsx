import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about-column">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                ⌂
              </span>
              ServiceHub
            </Link>
            <p className="footer-about">
              Find and book services managed directly by the ServiceHub team.
            </p>
          </div>

          <div className="footer-column">
            <h2>Explore</h2>
            <nav className="footer-links" aria-label="Explore links">
              <Link href="/services">All services</Link>
              <Link href="/services?category=Cleaning">Cleaning</Link>
              <Link href="/services?category=Plumbing">Plumbing</Link>
            </nav>
          </div>

          <div className="footer-column">
            <h2>For users</h2>
            <nav className="footer-links" aria-label="User links">
              <Link href="/user/bookings">My bookings</Link>
              <Link href="/login">User log in</Link>
              <Link href="/register">Create a user account</Link>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© ServiceHub. All rights reserved.</span>
          <span>Home services, made simpler.</span>
        </div>
      </div>
    </footer>
  );
}