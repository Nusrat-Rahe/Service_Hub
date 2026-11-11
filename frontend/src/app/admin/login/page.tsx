"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, House, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { loginUser, logoutUser } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await loginUser(email, password);
      if (!result.user) throw new Error("The server did not return an account.");
      if (result.user.role !== "admin") {
        await logoutUser();
        throw new Error("This account does not have administrator access.");
      }
      setUser(result.user);
      router.replace("/admin/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <Link className="admin-login-back" href="/"><ArrowLeft size={16} /> Back to ServiceHub</Link>
      <section className="admin-login-card">
        <Link aria-label="ServiceHub home" className="admin-login-brand" href="/">
          <span className="admin-brand-mark"><House aria-hidden="true" size={22} strokeWidth={2.2} /></span>
          <strong>Service<span>Hub</span></strong>
        </Link>
        <span className="admin-login-eyebrow">ADMIN PORTAL</span>
        <h1>Welcome back</h1>
        <p>Sign in with your administrator account to continue.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-login-email">Email address</label>
          <div className="admin-login-input"><Mail aria-hidden="true" size={17} /><input autoComplete="username" id="admin-login-email" onChange={(event) => setEmail(event.target.value)} placeholder="you@servicehub.com" required type="email" value={email} /></div>
          <label htmlFor="admin-login-password">Password</label>
          <div className="admin-login-input"><LockKeyhole aria-hidden="true" size={17} /><input autoComplete="current-password" id="admin-login-password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type="password" value={password} /></div>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button className="admin-button admin-login-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Signing in..." : "Sign in to dashboard"}</button>
        </form>
        <div className="admin-login-security"><LockKeyhole size={14} /> Your account is protected with secure sign-in</div>
      </section>
      <p className="admin-login-footer">© 2025 ServiceHub. Admin access only.</p>
    </main>
  );
}
