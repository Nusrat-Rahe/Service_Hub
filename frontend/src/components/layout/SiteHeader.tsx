"use client";

import Link from "next/link";
import { House, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthModal, { type AuthModalType } from "@/components/auth/AuthModal";
import { logoutUser, type AuthUser } from "@/lib/auth";

export default function SiteHeader() {
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);
  const { user, setUser, isLoadingUser } = useAuth();

  function handleAuthSuccess(authenticatedUser: AuthUser) {
    setUser(authenticatedUser);
    setAuthModal(null);
    router.replace("/");
  }

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error("Could not sign out.", error);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="ServiceHub home">
            <span className="brand-mark" aria-hidden="true">
              <House size={21} strokeWidth={2.2} />
            </span>
            <span className="brand-name">
              Service<span className="brand-hub">Hub</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            {!isLoadingUser &&
              (user ? (
                <details className="account-menu" ref={accountMenuRef}>
                  <summary
                    aria-label={`Open account menu for ${user.fullName}`}
                    className="account-avatar"
                    title={user.fullName}
                  >
                    <span aria-hidden="true">
                      {user.fullName.trim().charAt(0).toUpperCase()}
                    </span>
                  </summary>
                  <div className="account-menu-popover">
                    <div className="account-menu-profile">
                      <span
                        className="account-avatar account-avatar-large"
                        aria-hidden="true"
                      >
                        {user.fullName.trim().charAt(0).toUpperCase()}
                      </span>
                      <strong title={user.fullName}>{user.fullName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <nav
                      aria-label="Account navigation"
                      className="account-menu-links"
                    >
                      <Link
                        href="/user/dashboard"
                        onClick={() => {
                          accountMenuRef.current?.removeAttribute("open");
                        }}
                      >
                        <LayoutDashboard aria-hidden="true" size={18} />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/user/profile"
                        onClick={() => {
                          accountMenuRef.current?.removeAttribute("open");
                        }}
                      >
                        <UserRound aria-hidden="true" size={18} />
                        <span>Profile</span>
                      </Link>
                    </nav>
                    <button
                      className="account-menu-logout"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut aria-hidden="true" size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                </details>
              ) : (
                <>
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
                </>
              ))}
          </div>
        </div>
      </header>
      <AuthModal
        onClose={() => setAuthModal(null)}
        onSwitch={setAuthModal}
        onSuccess={handleAuthSuccess}
        type={authModal}
      />
    </>
  );
}