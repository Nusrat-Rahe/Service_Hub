import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, Wrench } from "lucide-react";
import type { PublicReviewRecord, ReviewRecord } from "@/lib/api";
import styles from "./reviews.module.css";

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

function Rating({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className={styles.reviewRating} role="img">
      <span className={styles.reviewStars} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star fill={index < rating ? "currentColor" : "none"} key={index} size={14} />
        ))}
      </span>
      <strong>{rating.toFixed(1)}</strong>
    </span>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function PublicReviewCard({ review }: { review: PublicReviewRecord }) {
  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewCardHeader}>
        <span aria-hidden="true" className={styles.reviewAvatar}>
          {review.customerProfileImage ? (
            <Image alt="" fill sizes="34px" src={review.customerProfileImage} unoptimized />
          ) : initials(review.customerName)}
        </span>
        <div className={styles.reviewIdentity}>
          <strong className={styles.reviewCustomerName} title={review.customerName}>{review.customerName}</strong>
          <span className={styles.reviewVerified}><BadgeCheck aria-hidden="true" size={14} /> Verified</span>
        </div>
      </header>
      <div className={styles.reviewMeta}>
        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
        <Rating rating={review.rating} />
      </div>
      <p className={styles.reviewComment}>{review.comment}</p>
      <footer className={styles.reviewService}>
        <span>Service · </span>
        <Link href={`/services/${review.serviceId}`}>{review.serviceName}</Link>
      </footer>
    </article>
  );
}

export function CustomerReviewCard({ review }: { review: ReviewRecord }) {
  const statusLabel = review.status === "Hidden" ? "Unpublished" : review.status;
  const statusClass = review.status === "Hidden" ? "unpublished" : review.status.toLowerCase();

  return (
    <article className={`${styles.reviewCard} ${styles.customerReviewCard}`}>
      <div className={styles.customerReviewImage}>
        {review.serviceImage ? (
          <Image
            alt={`${review.serviceName} service`}
            fill
            sizes="64px"
            src={review.serviceImage}
            unoptimized
          />
        ) : (
          <Wrench aria-hidden="true" size={21} />
        )}
      </div>
      <div className={styles.customerReviewContent}>
        <header className={styles.reviewCardHeader}>
          <strong className={styles.reviewCustomerName} title={review.customerName}>{review.customerName}</strong>
          <span className={`${styles.reviewStatus} ${styles[statusClass]}`}>{statusLabel}</span>
        </header>
        <strong className={styles.customerReviewService}>{review.serviceName}</strong>
        <div className={styles.reviewMeta}>
          <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
          <Rating rating={review.rating} />
        </div>
        <p className={styles.reviewComment}>{review.comment}</p>
      </div>
    </article>
  );
}
