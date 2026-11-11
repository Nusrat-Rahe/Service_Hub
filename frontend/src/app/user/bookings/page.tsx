"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, ClipboardList } from "lucide-react";
import { getMyBookings, type BookingRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./booking-pages.css";

function statusClass(status: string) {
  return status.toLowerCase();
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyBookings()
      .then(({ bookings: records }) => { if (active) setBookings(records); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load your bookings."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="customer-bookings-page">
      <header className="customer-bookings-heading"><div><span className="eyebrow">YOUR SERVICEHUB</span><h1>My bookings</h1><p>Keep track of your home service requests.</p></div><Link className="button" href="/services">Browse services</Link></header>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {isLoading ? <div className="customer-bookings-empty">Loading your bookings…</div> : bookings.length ? <div className="customer-bookings-list">{bookings.map((booking) => <article className="customer-booking-card" key={booking._id}><div className="customer-booking-card-main"><span className="customer-booking-icon"><ClipboardList size={20} /></span><div><span className="customer-booking-id">{booking.bookingId}</span><h2>{booking.serviceName}</h2><p><CalendarDays size={14} />{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.date))}</p></div></div><span className={`customer-booking-status status-${statusClass(booking.status)}`}>{booking.status}</span><strong className="customer-booking-price">{formatMoney(booking.price)}</strong><Link aria-label={`View ${booking.bookingId}`} className="customer-booking-open" href={`/user/bookings/${booking._id}`}><ChevronRight size={18} /></Link></article>)}</div> : !error && <div className="customer-bookings-empty"><ClipboardList size={28} /><h2>No bookings yet</h2><p>Your service requests will appear here once you book a service.</p><Link className="button" href="/services">Explore services</Link></div>}
    </main>
  );
}
