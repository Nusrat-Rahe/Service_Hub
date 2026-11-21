"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getReviewTestimonials, type PublicReviewRecord } from "@/lib/api";
import { PublicReviewCard } from "./ReviewCard";
import styles from "./reviews.module.css";

const homepageReviewLimit = 6;

export function ReviewTestimonials() {
  const [reviews, setReviews] = useState<PublicReviewRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getReviewTestimonials(0, homepageReviewLimit)
      .then((result) => {
        if (!active) return;
        setReviews(result.reviews);
        setTotal(result.total);
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
    <section aria-labelledby="customer-feedback-title" className={styles.testimonialsSection}>
      <div className={styles.reviewContainer}>
        <header className={styles.reviewHeading}>
          <span className={styles.reviewEyebrow}>CUSTOMER FEEDBACK</span>
          <h2 id="customer-feedback-title">What Our Customers Say</h2>
          <p>Real feedback from customers whose completed bookings have been verified.</p>
        </header>
        {error ? (
          <p className={styles.reviewMessage} role="alert">Customer reviews are unavailable right now.</p>
        ) : isLoading ? (
          <p className={styles.reviewMessage} role="status">Loading customer reviews…</p>
        ) : total === 0 ? (
          <p className={styles.reviewMessage}>No customer reviews available yet.</p>
        ) : (
          <>
            <div className={styles.reviewGrid}>
              {reviews.slice(0, homepageReviewLimit).map((review) => (
                <PublicReviewCard key={review._id} review={review} />
              ))}
            </div>
            {total > reviews.length && (
              <div className={styles.reviewViewAll}>
                <Link href="/reviews">View All Reviews <ArrowRight aria-hidden="true" size={16} /></Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
