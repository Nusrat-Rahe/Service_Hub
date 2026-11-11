"use client";

import { useState } from "react";
import type { FormEvent as FormEventType } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateMyProfile } from "@/lib/api";
import "../bookings/booking-pages.css";

export default function UserProfilePage() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveProfile(event: FormEventType<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const { user: updatedUser } = await updateMyProfile(fullName);
      setUser(updatedUser);
      setFullName(updatedUser.fullName);
      setNotice("Your profile has been updated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="customer-bookings-page">
      <header className="customer-bookings-heading"><div><span className="eyebrow">YOUR SERVICEHUB</span><h1>Profile</h1><p>Keep your account details up to date.</p></div></header>
      <form className="customer-profile-form" onSubmit={(event) => void saveProfile(event)}>
        <label htmlFor="customer-profile-name">Full name</label>
        <input autoComplete="name" id="customer-profile-name" maxLength={100} onChange={(event) => setFullName(event.target.value)} required value={fullName} />
        <label htmlFor="customer-profile-email">Email address</label>
        <input autoComplete="email" id="customer-profile-email" readOnly value={user?.email ?? ""} />
        {error && <p className="customer-bookings-error" role="alert">{error}</p>}
        {notice && <p className="customer-bookings-notice" role="status">{notice}</p>}
        <button className="button" disabled={isSaving} type="submit">{isSaving ? "Saving…" : "Save changes"}</button>
      </form>
    </main>
  );
}
