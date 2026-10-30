"use client";

import { useEffect, useRef } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export type AuthModalType = "login" | "register";

type AuthModalProps = {
  type: AuthModalType | null;
  onClose: () => void;
  onSwitch: (type: AuthModalType) => void;
};

export default function AuthModal({
  type,
  onClose,
  onSwitch,
}: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = type !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (type) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector<HTMLElement>("input")?.focus();
    } else if (!type && dialog.open) {
      dialog.close();
    }
  }, [type]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const isLogin = type === "login";

  return (
    <dialog
      aria-labelledby="auth-modal-title"
      className="auth-modal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      {type && (
        <>
          <button
            aria-label="Close dialog"
            className="auth-modal-close"
            onClick={onClose}
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div className="auth-modal-heading">
            <p className="eyebrow">{isLogin ? "Welcome back" : "Get started"}</p>
            <h2 id="auth-modal-title">
              {isLogin ? "Sign in to ServiceHub" : "Create your account"}
            </h2>
            <p>
              {isLogin
                ? "Access your account to manage your bookings and profile."
                : "Sign up to request home services and manage your bookings."}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <p className="auth-modal-switch">
            {isLogin ? "New to ServiceHub?" : "Already have an account?"}{" "}
            <button
              onClick={() => onSwitch(isLogin ? "register" : "login")}
              type="button"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </>
      )}
    </dialog>
  );
}
