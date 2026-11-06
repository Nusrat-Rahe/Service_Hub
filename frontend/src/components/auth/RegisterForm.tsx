"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import PasswordField from "@/components/auth/PasswordField";
import { registerUser, type AuthUser } from "@/lib/auth";

export default function RegisterForm({
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
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await registerUser(
        String(formData.get("fullName")),
        String(formData.get("email")),
        String(formData.get("password")),
      );
      if (!result.user) {
        throw new Error("Account was created but account details were not returned.");
      }
      onSuccess(result.user);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        maxLength={72}
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

      <button
        className="button auth-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="auth-message" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
