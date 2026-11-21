"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CustomerReviewCard } from "@/components/reviews/ReviewCard";
import { getMyReviews, type ReviewRecord } from "@/lib/api";
import styles from "@/components/reviews/reviews.module.css";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyReviews()
      .then((result) => {
        if (active) setReviews(result.reviews);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load your reviews.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => ({
    total: reviews.length,
    published: reviews.filter((review) => review.status === "Published").length,
    pending: reviews.filter((review) => review.status === "Pending").length,
  }), [reviews]);

  return (
    <main className={styles.customerReviewsPage}>
      <div className={styles.reviewContainer}>
        <header className={styles.reviewHeading}>
          <span className={styles.reviewEyebrow}>YOUR FEEDBACK</span>
          <h1>My Reviews</h1>
          <p>Your reviews and ratings</p>
        </header>
        <section aria-label="Review summary" className={styles.customerReviewsStats}>
          <article className={styles.customerReviewsStat}><span>Total Reviews</span><strong>{isLoading ? "—" : summary.total}</strong></article>
          <article className={styles.customerReviewsStat}><span>Published Reviews</span><strong>{isLoading ? "—" : summary.published}</strong></article>
          <article className={styles.customerReviewsStat}><span>Pending Reviews</span><strong>{isLoading ? "—" : summary.pending}</strong></article>
        </section>
        {error && <p className={styles.reviewMessage} role="alert">{error}</p>}
        {!error && isLoading && <p className={styles.reviewMessage} role="status">Loading your reviews…</p>}
        {!error && !isLoading && reviews.length === 0 && (
          <div className={styles.reviewMessage}>
            You have not submitted a review yet. Write one after a booking is completed.
            <div className={styles.reviewViewAll}>
              <Link href="/user/bookings">View my bookings <ArrowRight aria-hidden="true" size={15} /></Link>
            </div>
          </div>
        )}
        {!isLoading && !error && reviews.length > 0 && (
          <div className={styles.customerReviewsList}>
            {reviews.map((review) => <CustomerReviewCard key={review._id} review={review} />)}
          </div>
        )}
      </div>
    </main>
  );
}
