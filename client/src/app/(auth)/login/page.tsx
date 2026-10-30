"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login is not connected yet. Your details have not been sent.");
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <Link className="brand" href="/" aria-label="ServiceHub home">
          <span className="brand-mark" aria-hidden="true">
            ⌂
          </span>
          ServiceHub
        </Link>
        <Link className="auth-home-link" href="/">
          Back to home
        </Link>
      </div>

      <section className="auth-content" aria-labelledby="login-title">
        <div className="auth-card">
          <div className="auth-heading">
            <span className="auth-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="eyebrow">Welcome back</p>
            <h1 id="login-title">Sign in to ServiceHub</h1>
            <p>Access your account to manage your bookings and profile.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />

            <div className="auth-password-label">
              <label htmlFor="password">Password</label>
              <button
                className="auth-inline-button"
                onClick={() => setMessage("Password reset will be available when login is connected.")}
                type="button"
              >
                Forgot Password?
              </button>
            </div>
            <div className="auth-password-input">
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="auth-toggle-password"
                onClick={() => setShowPassword((isVisible) => !isVisible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label className="auth-remember" htmlFor="remember">
              <input id="remember" name="remember" type="checkbox" />
              <span>Remember me</span>
            </label>

            <button className="button auth-submit" type="submit">
              Sign in
            
            </button>

            <p className="auth-message" role="status" aria-live="polite">
              {message}
            </p>
          </form>

          <p className="auth-signup">
            New to ServiceHub? <Link href="/register">Create an account</Link>
          </p>
        </div>
        <p className="auth-note">
          Secure access to your service requests, all in one place.
        </p>
      </section>
    </main>
  );
}
