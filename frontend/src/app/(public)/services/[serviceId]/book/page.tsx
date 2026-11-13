"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import AuthModal, { type AuthModalType } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AuthUser } from "@/lib/auth";
import { createBooking, getService, type ServiceRecord } from "@/lib/api";
import { logoutUser } from "@/lib/auth";
import { parseDhakaDateTime, useDhakaToday } from "@/lib/dhaka-date";
import { formatMoney } from "@/lib/money";

export default function BookingRequestPage() {
  return <Suspense fallback={<main className="service-detail-page"><div className="container">Loading booking form…</div></main>}><BookingRequestContent /></Suspense>;
}

function BookingRequestContent() {
  const params = useParams<{ serviceId: string }>();
  const router = useRouter();
  const { user, setUser, isLoadingUser } = useAuth();
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);
  const today = useDhakaToday();

  useEffect(() => {
    let active = true;
    getService(params.serviceId)
      .then(({ service: record }) => { if (active) setService(record); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this service."); });
    return () => { active = false; };
  }, [params.serviceId]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !service) return;
    setError("");
    const appointmentDate = parseDhakaDateTime(date);
    if (!appointmentDate || date.slice(0, 10) < today) {
      setError("Choose today or a future appointment date.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { booking } = await createBooking({
        serviceId: service._id,
        date: appointmentDate.toISOString(),
        address,
        notes,
      });
      router.push(`/user/bookings/${booking._id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create your booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAuthSuccess(authenticatedUser: AuthUser) {
    setAuthModal(null);
    if (authenticatedUser.role !== "user") {
      try {
        await logoutUser();
      } catch (logoutError) {
        console.error("Could not sign out the administrator from the customer booking form.", logoutError);
      }
      setError("Please sign in with a customer account to request a service.");
      return;
    }
    setUser(authenticatedUser);
  }

  return (
    <>
    <main className="service-detail-page">
      <div className="container">
        <Link className="service-detail-back" href={service ? `/services/${service._id}` : "/services"}><ArrowLeft size={16} /> Back to service</Link>
        <section className="service-booking-card">
          <span className="eyebrow">BOOK A SERVICE</span>
          <h1>Request an appointment</h1>
          {service && <p className="service-booking-summary">{service.name} · from {formatMoney(service.price)}</p>}
          {error && <p className="service-form-error" role="alert">{error}</p>}
          {!isLoadingUser && !user ? <div className="service-login-prompt"><p>Sign in to your ServiceHub account to request this service.</p><button className="button" onClick={() => setAuthModal("login")} type="button">Sign in to continue</button></div> : user?.role === "admin" ? <div className="service-login-prompt"><p>A customer account is required to request a service.</p><Link className="button" href="/admin/dashboard">Go to admin dashboard</Link></div> : (
            <form className="service-booking-form" onSubmit={submitBooking}>
              <label htmlFor="booking-date">Preferred date and time</label>
              <div className="service-form-input"><CalendarDays size={17} /><input id="booking-date" min={`${today}T00:00`} onChange={(event) => setDate(event.target.value)} required type="datetime-local" value={date} /></div>
              <p className="service-payment-note">Appointment times use Bangladesh Standard Time (Asia/Dhaka).</p>
              <label htmlFor="booking-address">Service address</label>
              <div className="service-form-input"><MapPin size={17} /><input autoComplete="street-address" id="booking-address" maxLength={300} onChange={(event) => setAddress(event.target.value)} placeholder="Street address, city" required value={address} /></div>
              <label htmlFor="booking-notes">Anything else we should know? <span>(optional)</span></label>
              <textarea id="booking-notes" maxLength={1000} onChange={(event) => setNotes(event.target.value)} rows={4} value={notes} />
              <div className="service-booking-price"><span>Estimated service price</span><strong>{service ? formatMoney(service.price) : "Loading…"}</strong></div>
              <p className="service-payment-note">This request does not charge a payment method. Payment processing will be available once a payment provider is configured.</p>
              <button className="button" disabled={!service || isSubmitting} type="submit">{isSubmitting ? "Sending request…" : "Send booking request"}</button>
            </form>
          )}
        </section>
      </div>
    </main>
    <AuthModal onClose={() => setAuthModal(null)} onSwitch={setAuthModal} onSuccess={handleAuthSuccess} type={authModal} />
    </>
  );
}
