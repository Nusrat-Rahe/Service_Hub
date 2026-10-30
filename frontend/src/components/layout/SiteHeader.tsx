"use client";

import Link from "next/link";
import { useState } from "react";
import AuthModal, { type AuthModalType } from "@/components/auth/AuthModal";

export default function SiteHeader() {
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);

  return (
    <>
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
            <button
              aria-haspopup="dialog"
              className="button button-secondary"
              onClick={() => setAuthModal("login")}
              type="button"
            >
              Log in
            </button>
            <button
              aria-haspopup="dialog"
              className="button"
              onClick={() => setAuthModal("register")}
              type="button"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>
      <AuthModal
        onClose={() => setAuthModal(null)}
        onSwitch={setAuthModal}
        type={authModal}
      />
    </>
  );
}