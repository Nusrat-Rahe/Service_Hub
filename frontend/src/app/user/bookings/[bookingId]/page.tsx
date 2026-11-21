"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { cancelMyBooking, createReview, getMyBooking, getMyBookingPayment, type BookingRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../booking-pages.css";

function paymentMethodLabel(method?: BookingRecord["paymentMethod"]) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "bkash" || method === "bkash_demo") return "bKash";
  if (method === "card" || method === "card_demo") return "Card";
  return "Not selected";
}

export default function UserBookingPage() {
  return <Suspense fallback={<main className="customer-bookings-page"><div className="customer-bookings-empty">Loading booking details…</div></main>}><UserBookingContent /></Suspense>;
}

function UserBookingContent() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getMyBooking(bookingId), getMyBookingPayment(bookingId)])
      .then(([{ booking: record }, { payment }]) => {
        if (!active) return;
        setBooking(record);
        setPaymentId(payment?._id ?? "");
      })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this booking."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [bookingId]);

  async function cancelBooking() {
    if (!booking) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { booking: updated } = await cancelMyBooking(booking._id);
      setBooking(updated);
      setNotice("Your booking has been cancelled.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not cancel this booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking) return;
    setError("");
    setIsSubmitting(true);
    try {
      await createReview(booking._id, { rating, comment });
      setNotice("Thanks for sharing your feedback.");
      setComment("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <main className="customer-bookings-page"><div className="customer-bookings-empty">Loading booking details…</div></main>;
  if (error && !booking) return <main className="customer-bookings-page"><Link className="customer-booking-back" href="/user/bookings"><ArrowLeft size={16} /> My bookings</Link><p className="customer-bookings-error" role="alert">{error}</p></main>;
  if (!booking) return null;

  return (
    <main className="customer-bookings-page">
      <Link className="customer-booking-back" href="/user/bookings"><ArrowLeft size={16} /> My bookings</Link>
      <section className="customer-booking-detail">
        <div className="customer-booking-detail-heading"><div><span className="customer-booking-id">{booking.bookingId}</span><h1>{booking.serviceName}</h1></div><span className={`customer-booking-status status-${booking.status.toLowerCase()}`}>{booking.status}</span></div>
        <div className="customer-booking-detail-grid">
          <div><span><CalendarDays size={16} /> Appointment</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(booking.date))}{booking.startTime && booking.endTime ? ` (${booking.startTime}-${booking.endTime} Bangladesh time)` : ""}</strong></div>
          {booking.categoryName && <div><span>Category and service type</span><strong>{booking.categoryName}{booking.subcategoryName ? ` / ${booking.subcategoryName}` : ""}</strong></div>}
          {booking.phone && <div><span>Contact phone</span><strong>{booking.phone}</strong></div>}
          <div><span><MapPin size={16} /> Service address</span><strong>{booking.address}</strong></div>
          <div><span>Service price</span><strong>{formatMoney(booking.price)}</strong></div>
          <div><span>Payment method</span><strong>{paymentMethodLabel(booking.paymentMethod)}</strong></div>
          <div><span>Payment status</span><strong>{booking.paymentStatus}</strong></div>
          {booking.notes && <div className="customer-booking-notes"><span>Notes for the service team</span><strong>{booking.notes}</strong></div>}
        </div>
        {error && <p className="customer-bookings-error" role="alert">{error}</p>}
        {notice && <p className="customer-bookings-notice" role="status">{notice}</p>}
        {booking.status === "Pending" && !paymentId && booking.paymentStatus !== "Paid" && <button className="customer-booking-cancel" disabled={isSubmitting} onClick={cancelBooking} type="button">{isSubmitting ? "Cancelling…" : "Cancel booking request"}</button>}
        {booking.status === "Completed" && <form className="customer-review-form" onSubmit={submitReview}><h2>How was your service?</h2><label htmlFor="review-rating">Your rating</label><select id="review-rating" onChange={(event) => setRating(Number(event.target.value))} value={rating}><option value={5}>5 — Excellent</option><option value={4}>4 — Good</option><option value={3}>3 — Average</option><option value={2}>2 — Poor</option><option value={1}>1 — Very poor</option></select><label htmlFor="review-comment">Your feedback</label><textarea id="review-comment" maxLength={2000} minLength={1} onChange={(event) => setComment(event.target.value)} required rows={4} value={comment} /><button className="button" disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting…" : "Submit review"}</button></form>}
        <div className="customer-booking-payment-actions">
          <Link className="button" href={paymentId ? `/user/payments/${paymentId}` : `/user/bookings/${booking._id}/payment`}>{paymentId ? "View booking receipt" : "Choose payment method"}</Link>
          <Link className="customer-booking-back" href="/user/payments">Payment history</Link>
        </div>
      </section>
    </main>
  );
}
