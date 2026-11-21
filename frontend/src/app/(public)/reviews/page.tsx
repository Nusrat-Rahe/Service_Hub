"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { PublicReviewCard } from "@/components/reviews/ReviewCard";
import { getReviewTestimonials, type PublicReviewRecord } from "@/lib/api";
import styles from "@/components/reviews/reviews.module.css";

const pageSize = 9;

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<PublicReviewRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    setError("");
    try {
      const result = await getReviewTestimonials(reviews.length, pageSize);
      setReviews((current) => [...current, ...result.reviews]);
      setHasMore(result.hasMore);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load customer reviews.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [reviews.length]);

  useEffect(() => {
    let active = true;
    getReviewTestimonials(0, pageSize)
      .then((result) => {
        if (!active) return;
        setReviews(result.reviews);
        setHasMore(result.hasMore);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load customer reviews.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className={styles.allReviewsPage}>
      <div className={styles.reviewContainer}>
        <Link className={styles.reviewBackLink} href="/">
          <ArrowLeft aria-hidden="true" size={15} /> Back to home
        </Link>
        <header className={styles.reviewHeading}>
          <span className={styles.reviewEyebrow}>CUSTOMER FEEDBACK</span>
          <h1>What Our Customers Say</h1>
          <p>Real feedback from customers whose completed bookings have been verified.</p>
        </header>
        {error && <p className={styles.reviewMessage} role="alert">{error}</p>}
        {!error && isLoading && <p className={styles.reviewMessage} role="status">Loading customer reviews…</p>}
        {!isLoading && !error && reviews.length === 0 && (
          <p className={styles.reviewMessage}>No customer reviews available yet.</p>
        )}
        {reviews.length > 0 && (
          <>
            <div className={styles.reviewGrid}>
              {reviews.map((review) => <PublicReviewCard key={review._id} review={review} />)}
            </div>
            {hasMore && (
              <div className={styles.reviewLoadMore}>
                <button disabled={isLoadingMore} onClick={() => void loadMore()} type="button">
                  {isLoadingMore ? "Loading…" : <>Load more reviews <ArrowDown aria-hidden="true" size={15} /></>}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
