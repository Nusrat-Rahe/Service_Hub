"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BadgeCheck, CalendarDays, ChevronRight, ClipboardList, Star, X } from "lucide-react";
import { createReview, getMyBookings, getMyReviews, type BookingRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./booking-pages.css";

function statusClass(status: string) {
  return status.toLowerCase();
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(() => new Set());
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getMyBookings(), getMyReviews()])
      .then(([{ bookings: records }, { reviews }]) => {
        if (!active) return;
        setBookings(records);
        setReviewedBookingIds(new Set(reviews.map((review) => review.bookingId)));
      })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load your bookings."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  function openReview(booking: BookingRecord) {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setReviewError("");
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingReview(true);
    setReviewError("");
    try {
      await createReview(selectedBooking._id, { rating, comment });
      setReviewedBookingIds((current) => new Set(current).add(selectedBooking._id));
      setSelectedBooking(null);
    } catch (requestError) {
      setReviewError(requestError instanceof Error ? requestError.message : "Could not submit your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <main className="customer-bookings-page">
      <header className="customer-bookings-heading"><div><span className="eyebrow">YOUR SERVICEHUB</span><h1>My bookings</h1><p>Manage your bookings and leave reviews.</p></div><Link className="button" href="/services">Browse services</Link></header>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="customer-bookings-empty">Loading your bookings…</div>
      ) : bookings.length ? (
        <div className="customer-bookings-list">
          {bookings.map((booking) => (
            <article className="customer-booking-card" key={booking._id}>
              <div className="customer-booking-card-main">
                <span className="customer-booking-icon"><ClipboardList size={20} /></span>
                <div>
                  <span className="customer-booking-id">{booking.bookingId}</span>
                  <h2>{booking.serviceName}</h2>
                  <p>
                    <CalendarDays size={14} />
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(booking.date))}
                    {booking.startTime && booking.endTime ? ` · ${booking.startTime}-${booking.endTime} Bangladesh time` : ""}
                  </p>
                  {booking.categoryName && <small>{booking.categoryName}{booking.subcategoryName ? ` / ${booking.subcategoryName}` : ""}</small>}
                </div>
              </div>
              <span className={`customer-booking-status status-${statusClass(booking.status)}`}>{booking.status}</span>
              <strong className="customer-booking-price">{formatMoney(booking.price)}</strong>
              <div className="customer-booking-card-review">
                {booking.status === "Completed" && (reviewedBookingIds.has(booking._id) ? (
                  <span className="customer-review-submitted-indicator"><BadgeCheck size={14} /> Review Submitted</span>
                ) : (
                  <button className="customer-booking-review-button" onClick={() => openReview(booking)} type="button">
                    <Star size={14} /> Write Review
                  </button>
                ))}
              </div>
              <Link aria-label={`View ${booking.bookingId}`} className="customer-booking-open" href={`/user/bookings/${booking._id}`}>
                <ChevronRight size={18} />
              </Link>
            </article>
          ))}
        </div>
      ) : !error && (
        <div className="customer-bookings-empty">
          <ClipboardList size={28} />
          <h2>No bookings yet</h2>
          <p>Your service requests will appear here once you book a service.</p>
          <Link className="button" href="/services">Explore services</Link>
        </div>
      )}
      {selectedBooking && (
        <div
          className="customer-review-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmittingReview) setSelectedBooking(null);
          }}
          role="presentation"
        >
          <section aria-labelledby="customer-review-modal-title" aria-modal="true" className="customer-review-modal" role="dialog">
            <header>
              <div>
                <span>YOUR FEEDBACK</span>
                <h2 id="customer-review-modal-title">Review {selectedBooking.serviceName}</h2>
              </div>
              <button aria-label="Close review form" disabled={isSubmittingReview} onClick={() => setSelectedBooking(null)} type="button">
                <X size={18} />
              </button>
            </header>
            <form onSubmit={(event) => void submitReview(event)}>
              <fieldset>
                <legend>Your rating</legend>
                <div className="customer-review-rating-input">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        key={value}
                        onClick={() => setRating(value)}
                        type="button"
                      >
                        <Star fill={value <= rating ? "currentColor" : "none"} size={25} />
                      </button>
                    );
                  })}
                  <strong>{rating}.0</strong>
                </div>
              </fieldset>
              <label htmlFor="booking-review-comment">Your feedback</label>
              <textarea
                id="booking-review-comment"
                maxLength={2000}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us about your service experience"
                required
                rows={4}
                value={comment}
              />
              <span className="customer-review-character-count">{comment.length}/2000</span>
              {reviewError && <p className="customer-review-modal-error" role="alert">{reviewError}</p>}
              <div className="customer-review-modal-actions">
                <button disabled={isSubmittingReview} onClick={() => setSelectedBooking(null)} type="button">Cancel</button>
                <button className="customer-review-modal-submit" disabled={isSubmittingReview} type="submit">
                  {isSubmittingReview ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
