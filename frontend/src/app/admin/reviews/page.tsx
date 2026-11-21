"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Clock3, MessageSquareText, Star, X } from "lucide-react";
import { apiRequest, getAdminReviews, type ReviewRecord } from "@/lib/api";
import styles from "./reviews.module.css";

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

function statusLabel(status: ReviewRecord["status"]) {
  return status === "Hidden" ? "Unpublished" : status;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;
    getAdminReviews()
      .then(({ reviews: records }) => {
        if (active) setReviews(records);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load reviews.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((review) => review.status === "Pending").length,
    approved: reviews.filter((review) => review.status === "Published").length,
    rejected: reviews.filter((review) => review.status === "Rejected").length,
  }), [reviews]);

  async function updateReviewStatus(review: ReviewRecord, status: ReviewRecord["status"]) {
    setUpdatingId(review._id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/admin/reviews/${encodeURIComponent(review._id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setReviews((current) => current.map((item) => item._id === review._id ? { ...item, status } : item));
      setNotice(status === "Published" ? "Review approved." : status === "Rejected" ? "Review rejected." : "Review unpublished.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update this review.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className={`admin-page ${styles.adminReviewPage}`}>
      <header className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CUSTOMER FEEDBACK</span>
          <h1>Manage Reviews</h1>
          <p>Review management and moderation</p>
        </div>
      </header>
      <div aria-label="Review summary" className={styles.adminReviewStats}>
        <article><span>Total Reviews</span><strong>{isLoading ? "—" : summary.total}</strong><MessageSquareText aria-hidden="true" size={17} /></article>
        <article><span>Pending Reviews</span><strong>{isLoading ? "—" : summary.pending}</strong><Clock3 aria-hidden="true" size={17} /></article>
        <article><span>Approved Reviews</span><strong>{isLoading ? "—" : summary.approved}</strong><BadgeCheck aria-hidden="true" size={17} /></article>
        <article><span>Rejected Reviews</span><strong>{isLoading ? "—" : summary.rejected}</strong><X aria-hidden="true" size={17} /></article>
      </div>
      {error && <p className={styles.adminReviewError} role="alert">{error}</p>}
      {notice && <p className={styles.adminReviewNotice} role="status">{notice}</p>}
      <div className={`admin-card ${styles.adminReviewTableCard}`}>
        <div className="admin-table-toolbar">
          <div><h2>Submitted reviews</h2><span>{reviews.length} reviews</span></div>
        </div>
        {isLoading ? (
          <p className={styles.adminReviewEmpty} role="status">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className={styles.adminReviewEmpty}>No reviews have been submitted yet.</p>
        ) : (
          <div className={styles.adminReviewTableScroll}>
            <table className={styles.adminReviewTable}>
              <thead>
                <tr><th>Customer</th><th>Service</th><th>Booking Ref</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td><strong>{review.customerName}</strong><time>{formatReviewDate(review.createdAt)}</time></td>
                    <td><strong>{review.serviceName}</strong></td>
                    <td><span>{review.bookingReference || "—"}</span></td>
                    <td><span className={styles.adminReviewRating}><Star aria-hidden="true" fill="currentColor" size={14} /> {review.rating}.0</span></td>
                    <td className={styles.adminReviewComment}>{review.comment}</td>
                    <td><span className={`${styles.adminReviewStatus} ${styles[`status${review.status}`]}`}>{statusLabel(review.status)}</span></td>
                    <td>
                      <div className={styles.adminReviewActions}>
                        {review.status === "Pending" && (
                          <>
                            <button aria-label={`Approve review by ${review.customerName}`} disabled={updatingId === review._id} onClick={() => void updateReviewStatus(review, "Published")} type="button"><Check size={14} /> Approve</button>
                            <button aria-label={`Reject review by ${review.customerName}`} className={styles.rejectButton} disabled={updatingId === review._id} onClick={() => void updateReviewStatus(review, "Rejected")} type="button"><X size={14} /> Reject</button>
                          </>
                        )}
                        {review.status === "Published" && (
                          <button className={styles.unpublishButton} disabled={updatingId === review._id} onClick={() => void updateReviewStatus(review, "Hidden")} type="button">Unpublish</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
