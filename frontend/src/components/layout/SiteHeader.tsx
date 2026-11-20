"use client";

import Link from "next/link";
import { House, LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthModal, { type AuthModalType } from "@/components/auth/AuthModal";
import { logoutUser, type AuthUser } from "@/lib/auth";

export default function SiteHeader() {
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);
  const { user, setUser, isLoadingUser } = useAuth();

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (accountMenuRef.current?.hasAttribute("open") && !accountMenuRef.current.contains(target)) {
        accountMenuRef.current.removeAttribute("open");
      }
      if (mobileMenuRef.current?.hasAttribute("open") && !mobileMenuRef.current.contains(target)) {
        mobileMenuRef.current.removeAttribute("open");
      }
    }
    function handleNavigation() {
      accountMenuRef.current?.removeAttribute("open");
      mobileMenuRef.current?.removeAttribute("open");
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    window.addEventListener("popstate", handleNavigation);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

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
        <div className={`container header-inner${user?.role === "user" ? " has-customer-nav" : ""}`}>
          <Link className="brand" href="/" aria-label="ServiceHub home">
            <span className="brand-mark" aria-hidden="true">
              <House size={21} strokeWidth={2.2} />
            </span>
            <span className="brand-name">
              Service<span className="brand-hub">Hub</span>
            </span>
          </Link>

          <nav className={`nav-links${user?.role === "user" ? " customer-nav-links" : ""}`} aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            {user?.role === "user" && <Link href="/user/bookings">My Bookings</Link>}
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

          <details className="mobile-menu" ref={mobileMenuRef}>
            <summary aria-label="Open navigation menu" className="mobile-menu-button">
              <Menu aria-hidden="true" size={22} strokeWidth={2} />
            </summary>
            <div className="mobile-menu-popover">
              <nav aria-label="Mobile navigation" className="mobile-menu-links">
                <Link
                  href="/"
                  onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                >
                  Home
                </Link>
                <Link
                  href="/services"
                  onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                >
                  Services
                </Link>
                {user?.role === "user" && (
                  <Link
                    href="/user/bookings"
                    onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                  >
                    My Bookings
                  </Link>
                )}
                <Link
                  href="/#contact"
                  onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                >
                  Contact
                </Link>
              </nav>

              {!isLoadingUser &&
                (user ? (
                  <div className="mobile-menu-account">
                    <Link
                      href="/user/dashboard"
                      onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                    >
                      <LayoutDashboard aria-hidden="true" size={18} />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      href="/user/profile"
                      onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                    >
                      <UserRound aria-hidden="true" size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        mobileMenuRef.current?.removeAttribute("open");
                        handleLogout();
                      }}
                      type="button"
                    >
                      <LogOut aria-hidden="true" size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                ) : (
                  <div className="mobile-menu-auth">
                    <button
                      className="button button-secondary"
                      onClick={() => {
                        mobileMenuRef.current?.removeAttribute("open");
                        setAuthModal("login");
                      }}
                      type="button"
                    >
                      Log in
                    </button>
                    <button
                      className="button"
                      onClick={() => {
                        mobileMenuRef.current?.removeAttribute("open");
                        setAuthModal("register");
                      }}
                      type="button"
                    >
                      Sign up
                    </button>
                  </div>
                ))}
            </div>
          </details>
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