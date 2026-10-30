"use client";

import { FormEvent, useState } from "react";
import AuthPage from "@/components/auth/AuthPage";
import PasswordField from "@/components/auth/PasswordField";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setMessage(
      "Registration is not connected yet. Your details have not been sent or saved.",
    );
  }

  return (
    <AuthPage
      eyebrow="Get started"
      title="Create Your Account"
      titleId="register-title"
      description="Sign up to request home services and manage your bookings."
      icon={
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10-3v6m3-3h-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      accountPrompt="Already have an account?"
      accountLinkText="Sign in"
      accountHref="/login"
      note="Create an account to keep your service requests in one place."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
        <input
          autoComplete="name"
          id="fullName"
          maxLength={100}
          name="fullName"
          placeholder="Your full name"
          required
          type="text"
        />

        <label htmlFor="email">Email Address</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />

        <label htmlFor="password">Password</label>
        <PasswordField
          autoComplete="new-password"
          id="password"
          minLength={8}
          name="password"
          onToggleVisibility={() =>
            setShowPassword((isVisible) => !isVisible)
          }
          placeholder="At least 8 characters"
          required
          visible={showPassword}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <PasswordField
          autoComplete="new-password"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          placeholder="Re-enter your password"
          required
          visible={showPassword}
        />

        <label className="auth-terms" htmlFor="terms">
          <input id="terms" name="terms" required type="checkbox" />
          <span>I agree to the terms and privacy policy.</span>
        </label>

        <button className="button auth-submit" type="submit">
          Create Account
        </button>

        <p className="auth-message" role="status" aria-live="polite">
          {message}
        </p>
      </form>
    </AuthPage>
  );
}
