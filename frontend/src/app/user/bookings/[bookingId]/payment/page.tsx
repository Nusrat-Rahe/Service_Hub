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
  type PaymentMethod,
} from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../../booking-pages.css";

const methods: Array<{
  id: PaymentMethod;
  title: string;
  icon: typeof CreditCard;
}> = [
  { id: "bkash_demo", title: "bKash", icon: Banknote },
  { id: "card_demo", title: "Card", icon: CreditCard },
  { id: "cod", title: "Cash on Delivery", icon: Banknote },
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
  const [method, setMethod] = useState<PaymentMethod>("bkash_demo");
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
        <div><span className="eyebrow">PAYMENT CHECKOUT</span><h1>Choose how to pay</h1><p>Online payment records do not represent real transactions. No payment credentials are requested or stored.</p></div>
      </header>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {booking && <div className="payment-checkout-grid">
        <section className="customer-booking-detail payment-summary-card">
          <span className="customer-booking-id">{booking.bookingId}</span>
          <h2>{booking.serviceName}</h2>
          <div className="payment-summary-details">
            <div><span>Booking reference</span><strong>{booking.bookingId}</strong></div>
            <div><span>Service</span><strong>{booking.serviceName}</strong></div>
            <div><span>Appointment</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.date))}</strong></div>
            <div><span>Service address</span><strong>{booking.address}</strong></div>
            {booking.notes && <div><span>Service notes</span><strong>{booking.notes}</strong></div>}
            <div className="payment-total"><span>Total amount</span><strong>{formatMoney(booking.price)}</strong></div>
          </div>
        </section>
        <section className="customer-booking-detail payment-method-card">
          <h2>Payment method</h2>
          <p>Select an online payment method or choose Cash on Delivery.</p>
          <div className="payment-method-options">
            {methods.map(({ id, title, icon: Icon }) => (
              <label className={`payment-method-option${method === id ? " is-selected" : ""}`} key={id}>
                <input checked={method === id} name="payment-method" onChange={() => setMethod(id)} type="radio" value={id} />
                <span className="payment-method-icon"><Icon size={19} /></span>
                <span><strong>{title}</strong></span>
              </label>
            ))}
          </div>
          {method === "cod" && <div className="payment-method-note"><Banknote size={17} /><span>Cash on Delivery stays pending until an administrator confirms payment after service completion.</span></div>}
          <button className="button payment-submit-button" disabled={isSubmitting} onClick={submitPayment} type="button">
            {isSubmitting ? "Saving payment…" : method === "cod" ? "Choose Cash on Delivery" : "Confirm online payment"}
          </button>
        </section>
      </div>}
    </main>
  );
}
