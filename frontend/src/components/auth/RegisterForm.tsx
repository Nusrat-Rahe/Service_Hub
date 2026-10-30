"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import PasswordField from "@/components/auth/PasswordField";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
  );
}
