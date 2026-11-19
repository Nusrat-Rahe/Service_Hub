"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, House, Printer, ReceiptText } from "lucide-react";
import { getMyPayment, type PaymentBookingDetails, type PaymentMethod, type PaymentRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../../bookings/booking-pages.css";

function methodLabel(method?: PaymentMethod) {
  if (method === "bkash_demo") return "bKash";
  if (method === "card_demo") return "Card";
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
        <Link className="customer-booking-back" href="/user/payments"><ArrowLeft size={16} /> Payment history</Link>
        <button className="payment-print-button" onClick={() => window.print()} type="button"><Printer size={16} /> Print receipt</button>
      </div>
      <article className="payment-receipt-card">
        <header className="payment-receipt-brand">
          <span className="payment-receipt-logo"><House size={20} /></span>
          <span><strong>ServiceHub</strong><small>HOME SERVICE RECEIPT</small></span>
          <span className={`payment-status-badge status-${payment.status.toLowerCase()}`}>{payment.status}</span>
        </header>
        <div className="payment-receipt-title">
          <ReceiptText size={22} />
          <div><h1>Payment details</h1><p>Transaction reference: {payment.transactionId}</p></div>
        </div>
        <div className="payment-receipt-grid">
          <div><span>Transaction ID</span><strong>{payment.transactionId}</strong></div>
          <div><span>Booking ID</span><strong>{payment.bookingCode ?? booking?.bookingId ?? payment.bookingId}</strong></div>
          <div><span>Customer</span><strong>{payment.customerName}</strong></div>
          <div><span>Email</span><strong>{payment.customerEmail || "—"}</strong></div>
          <div><span>Service</span><strong>{payment.serviceName}</strong></div>
          {booking && <div><span>Appointment</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.date))}</strong></div>}
          <div><span>Payment method</span><strong>{methodLabel(payment.paymentMethod)}</strong></div>
          <div><span>Payment date</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" }).format(new Date(payment.date))}</strong></div>
          <div className="payment-receipt-total"><span>Amount</span><strong>{formatMoney(payment.amount)}</strong></div>
        </div>
        <p className="payment-receipt-disclaimer">ServiceHub does not process real financial transactions. No payment credentials were requested or stored. Cash on Delivery remains pending until payment is confirmed after service completion.</p>
        <footer>Thank you for choosing ServiceHub.</footer>
      </article>
    </main>
  );
}
