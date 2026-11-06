"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import PasswordField from "@/components/auth/PasswordField";
import { loginUser, type AuthUser } from "@/lib/auth";

export default function LoginForm({
  onSuccess,
}: {
  onSuccess: (user: AuthUser) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await loginUser(
        String(formData.get("email")),
        String(formData.get("password")),
      );
      if (!result.user) {
        throw new Error("Sign-in succeeded but account details were not returned.");
      }
      onSuccess(result.user);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sign-in failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={() => setMessage("Password reset is not available yet.")}
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

      <button
        className="button auth-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="auth-message" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
