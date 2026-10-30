"use client";

import { FormEvent, useState } from "react";
import AuthPage from "@/components/auth/AuthPage";
import PasswordField from "@/components/auth/PasswordField";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login is not connected yet. Your details have not been sent.");
  }

  return (
    <AuthPage
      eyebrow="Welcome back"
      title="Sign in to ServiceHub"
      titleId="login-title"
      description="Access your account to manage your bookings and profile."
      icon={
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5m5 5H3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      accountPrompt="New to ServiceHub?"
      accountLinkText="Create an account"
      accountHref="/register"
      note="Secure access to your service requests, all in one place."
    >
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
            onClick={() =>
              setMessage(
                "Password reset will be available when login is connected.",
              )
            }
            type="button"
          >
            Forgot Password?
          </button>
        </div>
        <PasswordField
          autoComplete="current-password"
          id="password"
          name="password"
          onToggleVisibility={() =>
            setShowPassword((isVisible) => !isVisible)
          }
          placeholder="Enter your password"
          required
          visible={showPassword}
        />

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
    </AuthPage>
  );
}
