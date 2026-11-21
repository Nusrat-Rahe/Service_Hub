"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, House, Printer, ReceiptText } from "lucide-react";
import { getMyPayment, type PaymentBookingDetails, type PaymentMethod, type PaymentRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../../bookings/booking-pages.css";

function methodLabel(method?: PaymentMethod) {
  if (method === "bkash" || method === "bkash_demo") return "bKash";
  if (method === "card" || method === "card_demo") return "Card";
  if (method === "cod") return "Cash on Delivery";
  return "Legacy payment";
}

export default function PaymentReceiptPage() {
  return (
    <Suspense fallback={<main className="customer-bookings-page"><div className="customer-bookings-empty">Loading receipt…</div></main>}>
      <PaymentReceiptContent />
    </Suspense>
  );
}

function PaymentReceiptContent() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [booking, setBooking] = useState<PaymentBookingDetails | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyPayment(paymentId)
      .then((result) => {
        if (!active) return;
        setPayment(result.payment);
        setBooking(result.booking);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this receipt.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [paymentId]);

  if (isLoading) return <main className="customer-bookings-page"><div className="customer-bookings-empty">Loading receipt…</div></main>;
  if (!payment) return <main className="customer-bookings-page"><Link className="customer-booking-back" href="/user/payments"><ArrowLeft size={16} /> Payment history</Link><p className="customer-bookings-error" role="alert">{error || "Payment not found."}</p></main>;

  return (
    <main className="customer-bookings-page payment-receipt-page">
      <div className="payment-receipt-actions">
        <div className="payment-receipt-links">
          <Link className="customer-booking-back" href={`/user/bookings/${payment.bookingId}`}><ArrowLeft size={16} /> Booking details</Link>
          <Link className="payment-receipt-history-link" href="/user/payments">Payment history</Link>
        </div>
        <button className="payment-print-button" onClick={() => window.print()} type="button"><Printer size={16} /> Print receipt</button>
      </div>
      <article className="payment-receipt-card">
        <p className="payment-receipt-confirmation"><CheckCircle2 size={18} /> Booking saved successfully. Your receipt is ready.</p>
        <header className="payment-receipt-brand">
          <span className="payment-receipt-logo"><House size={20} /></span>
          <span><strong>ServiceHub</strong><small>HOME SERVICE RECEIPT</small></span>
          <span className={`payment-status-badge status-${payment.status.toLowerCase()}`}>{payment.status}</span>
        </header>
        <div className="payment-receipt-title">
          <ReceiptText size={22} />
          <div><h1>Booking receipt</h1><p>Transaction reference: {payment.transactionId}</p></div>
        </div>
        <div className="payment-receipt-grid">
          <div><span>Transaction ID</span><strong>{payment.transactionId}</strong></div>
          <div><span>Booking ID</span><strong>{payment.bookingCode ?? booking?.bookingId ?? payment.bookingId}</strong></div>
          <div><span>Customer</span><strong>{payment.customerName}</strong></div>
          <div><span>Email</span><strong>{payment.customerEmail || "—"}</strong></div>
          <div><span>Service</span><strong>{payment.serviceName}</strong></div>
          {booking && <div><span>Appointment</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(booking.date))}{booking.startTime && booking.endTime ? ` (${booking.startTime}-${booking.endTime} Bangladesh time)` : ""}</strong></div>}
          {booking?.categoryName && <div><span>Category and service type</span><strong>{booking.categoryName}{booking.subcategoryName ? ` / ${booking.subcategoryName}` : ""}</strong></div>}
          {booking?.phone && <div><span>Contact phone</span><strong>{booking.phone}</strong></div>}
          {booking?.address && <div><span>Service address</span><strong>{booking.address}</strong></div>}
          {booking?.notes && <div><span>Service notes</span><strong>{booking.notes}</strong></div>}
          {booking && <div><span>Booking status</span><strong>{booking.status}</strong></div>}
          <div><span>Payment method</span><strong>{methodLabel(payment.paymentMethod)}</strong></div>
          <div><span>Payment status</span><strong>{payment.status}</strong></div>
          <div><span>Payment date</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(payment.date))}</strong></div>
          <div className="payment-receipt-total"><span>Total amount</span><strong>{formatMoney(payment.amount)}</strong></div>
        </div>
        <footer>Thank you for choosing ServiceHub.</footer>
      </article>
    </main>
  );
}
