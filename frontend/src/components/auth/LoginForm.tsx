"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import PasswordField from "@/components/auth/PasswordField";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login is not connected yet. Your details have not been sent.");
  }

  return (
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
  );
}
