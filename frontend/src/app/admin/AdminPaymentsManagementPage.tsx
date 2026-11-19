"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Eye, ReceiptText, Search, ShieldCheck, X } from "lucide-react";
import {
  confirmCodPayment,
  getAdminPayment,
  getAdminPayments,
  type AdminPaymentSummary,
  type PaymentMethod,
  type PaymentRecord,
} from "@/lib/api";
import { formatMoney } from "@/lib/money";

function methodLabel(method?: PaymentMethod) {
  if (method === "bkash_demo") return "bKash";
  if (method === "card_demo") return "Card";
  if (method === "cod") return "Cash on Delivery";
  return "Legacy payment";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminPaymentsManagementPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<AdminPaymentSummary>({ total: 0, paid: 0, pending: 0, failed: 0 });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getAdminPayment>> | null>(null);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      getAdminPayments({ q: query.trim(), status, method })
        .then((result) => {
          if (!active) return;
          setPayments(result.payments);
          setSummary(result.summary);
          setError("");
        })
        .catch((requestError: unknown) => {
          if (active) setError(requestError instanceof Error ? requestError.message : "Could not load payments.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [method, query, status]);

  async function openDetails(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailError("");
    try {
      setDetail(await getAdminPayment(id));
    } catch (requestError) {
      setDetailError(requestError instanceof Error ? requestError.message : "Could not load payment details.");
    }
  }

  async function markCodPaid(payment: PaymentRecord) {
    if (payment.bookingStatus !== "Completed") {
      setNotice("COD can only be confirmed after the related booking is completed.");
      return;
    }
    if (!window.confirm(`Confirm payment for booking ${payment.bookingCode ?? payment.bookingId}?`)) return;
    setUpdatingId(payment._id);
    setNotice("");
    try {
      await confirmCodPayment(payment._id);
      const result = await getAdminPayments({ q: query.trim(), status, method });
      setPayments(result.payments);
      setSummary(result.summary);
      setNotice("COD payment confirmed and booking status synchronized.");
      if (selectedId === payment._id) {
        setDetail(await getAdminPayment(payment._id));
      }
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Could not confirm COD payment.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">TRANSACTIONS</span><h1>Payment management</h1><p>Review online payments and confirm cash payments after service completion.</p></div>
      </div>
      <div className="admin-stats-grid payment-admin-stats">
        <article className="admin-card admin-stat-card"><div className="admin-stat-top"><span className="admin-stat-icon tone-mint"><ReceiptText size={17} /></span></div><span className="admin-stat-label">Total payments</span><div className="admin-stat-bottom"><strong>{summary.total.toLocaleString()}</strong></div></article>
        <article className="admin-card admin-stat-card"><div className="admin-stat-top"><span className="admin-stat-icon tone-mint"><CheckCircle2 size={17} /></span></div><span className="admin-stat-label">Paid payments</span><div className="admin-stat-bottom"><strong>{summary.paid.toLocaleString()}</strong></div></article>
        <article className="admin-card admin-stat-card"><div className="admin-stat-top"><span className="admin-stat-icon tone-amber"><Banknote size={17} /></span></div><span className="admin-stat-label">Pending payments</span><div className="admin-stat-bottom"><strong>{summary.pending.toLocaleString()}</strong></div></article>
        <article className="admin-card admin-stat-card"><div className="admin-stat-top"><span className="admin-stat-icon tone-violet"><CreditCard size={17} /></span></div><span className="admin-stat-label">Failed payments</span><div className="admin-stat-bottom"><strong>{summary.failed.toLocaleString()}</strong></div></article>
      </div>

      <div className="admin-card admin-table-card payment-admin-table-card">
        <div className="admin-table-toolbar">
          <div><h2>Payment records</h2><span>{payments.length} matching transactions</span></div>
          <div className="admin-table-tools payment-admin-filters">
            <label className="admin-table-search"><Search size={16} /><input aria-label="Search transaction or booking ID" onChange={(event) => { setIsLoading(true); setQuery(event.target.value); }} placeholder="Transaction or booking ID" value={query} /></label>
            <label className="admin-filter"><select aria-label="Filter by payment status" onChange={(event) => { setIsLoading(true); setStatus(event.target.value); }} value={status}><option value="">All statuses</option><option>Paid</option><option>Pending</option><option>Failed</option><option>Refunded</option></select></label>
            <label className="admin-filter"><select aria-label="Filter by payment method" onChange={(event) => { setIsLoading(true); setMethod(event.target.value); }} value={method}><option value="">All methods</option><option value="bkash_demo">bKash</option><option value="card_demo">Card</option><option value="cod">Cash on Delivery</option></select></label>
          </div>
        </div>
        {error && <p className="admin-error payment-admin-error" role="alert">{error}</p>}
        <div className="admin-table-scroll">
          <table className="admin-table payment-admin-table">
            <thead><tr><th>TRANSACTION</th><th>BOOKING</th><th>CUSTOMER</th><th>SERVICE</th><th>DATE</th><th>METHOD</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>{payments.map((payment) => <tr key={payment._id}>
              <td><span className="admin-record-id">{payment.transactionId}</span></td>
              <td><span className="admin-record-id">{payment.bookingCode ?? payment.bookingId}</span></td>
              <td><span className="admin-table-primary">{payment.customerName}</span><span className="admin-table-secondary">{payment.customerEmail}</span></td>
              <td>{payment.serviceName}</td>
              <td>{formatDate(payment.date)}</td>
              <td>{methodLabel(payment.paymentMethod)}</td>
              <td className="admin-price">{formatMoney(payment.amount)}</td>
              <td><span className={`admin-status status-${payment.status.toLowerCase()}`}><i />{payment.status}</span></td>
              <td className="payment-admin-actions">
                <button aria-label={`View ${payment.transactionId}`} className="admin-table-action" onClick={() => void openDetails(payment._id)} title="View details" type="button"><Eye size={15} /></button>
                {payment.paymentMethod === "cod" && payment.status === "Pending" && <button className="admin-button payment-confirm-button" disabled={updatingId === payment._id || payment.bookingStatus !== "Completed"} onClick={() => void markCodPaid(payment)} title={payment.bookingStatus === "Completed" ? "Confirm COD payment" : "Available after booking completion"} type="button">{updatingId === payment._id ? "Saving…" : "Mark paid"}</button>}
              </td>
            </tr>)}</tbody>
          </table>
        </div>
        {isLoading && <div className="admin-table-empty">Loading payment records…</div>}
        {!isLoading && !error && payments.length === 0 && <div className="admin-table-empty">No payments match your search. Transactions will appear here after customers make a payment choice.</div>}
        <div className="admin-table-footer"><span>Showing <strong>{payments.length}</strong> matching records</span><span>Summary covers all transactions</span></div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      {selectedId && <div className="payment-admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(""); }}>
        <section aria-labelledby="payment-detail-title" aria-modal="true" className="payment-admin-modal" role="dialog">
          <header><div><span className="admin-eyebrow">SERVICEHUB RECEIPT</span><h2 id="payment-detail-title">Payment details</h2></div><button aria-label="Close payment details" className="admin-table-action" onClick={() => setSelectedId("")} type="button"><X size={17} /></button></header>
          {detailError && <p className="admin-error" role="alert">{detailError}</p>}
          {!detail && !detailError && <p className="admin-table-empty">Loading payment details…</p>}
          {detail && <div className="payment-admin-detail">
            <div className="payment-admin-detail-status"><span>Payment status</span><span className={`admin-status status-${detail.payment.status.toLowerCase()}`}><i />{detail.payment.status}</span></div>
            <div><span>Transaction ID</span><strong>{detail.payment.transactionId}</strong></div>
            <div><span>Booking ID</span><strong>{detail.payment.bookingCode ?? detail.booking?.bookingId ?? detail.payment.bookingId}</strong></div>
            <div><span>Customer</span><strong>{detail.customer?.fullName ?? detail.payment.customerName}</strong></div>
            <div><span>Customer email</span><strong>{detail.customer?.email ?? detail.payment.customerEmail ?? "—"}</strong></div>
            <div><span>Service</span><strong>{detail.payment.serviceName}</strong></div>
            <div><span>Appointment</span><strong>{detail.booking ? formatDate(detail.booking.date) : "—"}</strong></div>
            <div><span>Service address</span><strong>{detail.booking?.address ?? "—"}</strong></div>
            <div><span>Payment method</span><strong>{methodLabel(detail.payment.paymentMethod)}</strong></div>
            <div><span>Payment date</span><strong>{formatDate(detail.payment.date)}</strong></div>
            <div><span>Amount</span><strong>{formatMoney(detail.payment.amount)}</strong></div>
            {detail.payment.paymentMethod === "cod" && detail.payment.status === "Pending" && <div className="payment-admin-cod-note"><ShieldCheck size={16} /> COD can be marked Paid only after this booking is completed.</div>}
            <p className="payment-admin-disclaimer">ServiceHub does not process real financial transactions. No payment credentials were requested or stored.</p>
            {detail.payment.paymentMethod === "cod" && detail.payment.status === "Pending" && <button className="admin-button" disabled={updatingId === detail.payment._id || detail.booking?.status !== "Completed"} onClick={() => void markCodPaid({ ...detail.payment, bookingStatus: detail.booking?.status })} type="button">{updatingId === detail.payment._id ? "Saving…" : "Confirm COD as paid"}</button>}
          </div>}
        </section>
      </div>}
    </section>
  );
}
