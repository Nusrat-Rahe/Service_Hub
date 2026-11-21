"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCategory, type CategoryRecord } from "@/lib/api";

export default function ServiceCategoryPage({ slug }: { slug: string }) {
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategory(slug)
      .then(({ category: record }) => { if (active) setCategory(record); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this category.");
      });
    return () => { active = false; };
  }, [slug]);

  if (!category) {
    return <main className="service-category-page"><div className="container"><p role={error ? "alert" : "status"}>{error || "Loading service types…"}</p></div></main>;
  }

  return (
    <main className="service-category-page">
      <div className="container">
        <Link className="service-detail-back" href="/services">
          <ArrowLeft size={16} /> All services
        </Link>
        <header className="service-category-heading">
          <span className="eyebrow">{category.name}</span>
          <h1>{category.heading}</h1>
          <p>Select the type of service that best suits your needs.</p>
        </header>
        <div className="service-category-grid">
          {category.subcategories.map((serviceType) => (
            <Link
              className="service-category-card"
              href={`/services/${category.slug}/${serviceType.slug}`}
              key={serviceType.slug}
            >
              <span className="service-category-arrow" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
              <h2>{serviceType.name}</h2>
              <p>{serviceType.description}</p>
              <span className="service-category-link">View service details</span>
            </Link>
          ))}
        </div>
        {!category.subcategories.length && <p>No service types are available right now.</p>}
      </div>
    </main>
  );
}
