"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CreditCard, ReceiptText } from "lucide-react";
import { getMyPayments, type PaymentMethod, type PaymentRecord, type PaymentStatus } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import "./../bookings/booking-pages.css";

function methodLabel(method?: PaymentMethod) {
  if (method === "bkash" || method === "bkash_demo") return "bKash";
  if (method === "card" || method === "card_demo") return "Card";
  if (method === "cod") return "Cash on Delivery";
  return "Legacy payment";
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyPayments({ status, method })
      .then(({ payments: records }) => {
        if (!active) return;
        setPayments(records);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load your payment history.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [method, status]);

  return (
    <main className="customer-bookings-page payment-history-page">
      <header className="customer-bookings-heading">
        <div><span className="eyebrow">YOUR ACCOUNT</span><h1>Payment history</h1><p>Review receipts and payment status for your bookings.</p></div>
        <Link className="button" href="/user/bookings">My bookings</Link>
      </header>
      <div className="payment-history-filters">
        <label>Status
          <select onChange={(event) => { setIsLoading(true); setStatus(event.target.value); }} value={status}>
            <option value="">All statuses</option>
            {(["Paid", "Pending", "Failed", "Refunded"] as PaymentStatus[]).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>Payment method
          <select onChange={(event) => { setIsLoading(true); setMethod(event.target.value); }} value={method}>
            <option value="">All methods</option>
            <option value="bkash">bKash</option>
            <option value="card">Card</option>
            <option value="cod">Cash on Delivery</option>
          </select>
        </label>
      </div>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {isLoading ? <div className="customer-bookings-empty">Loading your payment history…</div>
        : payments.length ? <div className="payment-history-list">
          {payments.map((payment) => <article className="payment-history-card" key={payment._id}>
            <span className="payment-history-icon"><ReceiptText size={20} /></span>
            <div className="payment-history-main">
              <span className="customer-booking-id">{payment.transactionId}</span>
              <h2>{payment.serviceName}</h2>
              <p>Booking {payment.bookingCode ?? payment.bookingId}</p>
            </div>
            <div className="payment-history-amount"><strong>{formatMoney(payment.amount)}</strong><span>{methodLabel(payment.paymentMethod)}</span></div>
            <div className="payment-history-date">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(payment.date))}</div>
            <span className={`payment-status-badge status-${payment.status.toLowerCase()}`}>{payment.status}</span>
            <Link aria-label={`View transaction ${payment.transactionId}`} className="customer-booking-open" href={`/user/payments/${payment._id}`}><ArrowUpRight size={17} /></Link>
          </article>)}
        </div> : !error && <div className="customer-bookings-empty">
          <CreditCard size={30} />
          <h2>{status || method ? "No matching payments" : "No payments yet"}</h2>
          <p>{status || method ? "Try changing the filters to see other transactions." : "Payments for your ServiceHub bookings will appear here."}</p>
          <Link className="button" href="/services">Browse services</Link>
        </div>}
    </main>
  );
}
