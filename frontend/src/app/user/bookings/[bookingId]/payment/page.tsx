"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CreditCard } from "lucide-react";
import {
  createBookingPayment,
  getMyBooking,
  getMyBookingPayment,
  type BookingRecord,
  type BookingPaymentMethod,
} from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../../booking-pages.css";

const methods: Array<{
  id: BookingPaymentMethod;
  title: string;
  note: string;
  icon: typeof CreditCard;
}> = [
  { id: "bkash", title: "bKash", note: "Academic project simulation; no real transaction.", icon: Banknote },
  { id: "card", title: "Card", note: "Academic project simulation; no real transaction.", icon: CreditCard },
  { id: "cod", title: "Cash on Delivery", note: "Payment remains pending until received.", icon: Banknote },
];

export default function BookingPaymentPage() {
  return (
    <Suspense fallback={<main className="customer-bookings-page"><div className="customer-bookings-empty">Loading payment options…</div></main>}>
      <BookingPaymentContent />
    </Suspense>
  );
}

function BookingPaymentContent() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [method, setMethod] = useState<BookingPaymentMethod>("cod");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getMyBooking(bookingId), getMyBookingPayment(bookingId)])
      .then(([{ booking: record }, { payment }]) => {
        if (!active) return;
        if (payment) {
          router.replace(`/user/payments/${payment._id}`);
          return;
        }
        if (record.paymentStatus === "Paid") {
          setError("This booking is already marked paid. Contact ServiceHub support if you need a receipt.");
          return;
        }
        setBooking(record);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this booking.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [bookingId, router]);

  async function submitPayment() {
    if (!booking) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { payment } = await createBookingPayment(booking._id, method);
      router.push(`/user/payments/${payment._id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save your payment choice.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="customer-bookings-page"><div className="customer-bookings-empty">Loading payment options…</div></main>;
  }

  return (
    <main className="customer-bookings-page payment-page">
      <Link className="customer-booking-back" href={`/user/bookings/${bookingId}`}><ArrowLeft size={16} /> Booking details</Link>
      <header className="customer-bookings-heading">
        <div><span className="eyebrow">BOOKING PAYMENT</span><h1>Choose a payment method</h1><p>bKash and Card are simulated for this academic project. No real transaction or payment details are required.</p></div>
      </header>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {booking && <div className="payment-checkout-grid">
        <section className="customer-booking-detail payment-summary-card">
          <span className="customer-booking-id">{booking.bookingId}</span>
          <h2>{booking.serviceName}</h2>
          <div className="payment-summary-details">
            <div><span>Booking reference</span><strong>{booking.bookingId}</strong></div>
            <div><span>Service</span><strong>{booking.serviceName}</strong></div>
            <div><span>Appointment</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(booking.date))}</strong></div>
            <div><span>Service address</span><strong>{booking.address}</strong></div>
            {booking.notes && <div><span>Service notes</span><strong>{booking.notes}</strong></div>}
            <div className="payment-total"><span>Total amount</span><strong>{formatMoney(booking.price)}</strong></div>
          </div>
        </section>
        <section className="customer-booking-detail payment-method-card">
          <h2>Payment method</h2>
          <p>Choose one payment method for this booking.</p>
          <div className="payment-method-options">
            {methods.map(({ id, title, note, icon: Icon }) => (
              <label className={`payment-method-option${method === id ? " is-selected" : ""}`} key={id}>
                <input checked={method === id} name="payment-method" onChange={() => setMethod(id)} type="radio" value={id} />
                <span className="payment-method-icon"><Icon size={19} /></span>
                <span><strong>{title}</strong><small>{note}</small></span>
              </label>
            ))}
          </div>
          {method !== "cod" && <div className="payment-method-note"><CreditCard size={17} /><span>No PIN, OTP, card number, or external payment site is used.</span></div>}
          {method === "cod" && <div className="payment-method-note"><Banknote size={17} /><span>Cash on Delivery stays pending until an administrator confirms payment after service completion.</span></div>}
          <button className="button payment-submit-button" disabled={isSubmitting} onClick={submitPayment} type="button">
            {isSubmitting ? "Confirming…" : "Confirm Booking"}
          </button>
        </section>
      </div>}
    </main>
  );
}
