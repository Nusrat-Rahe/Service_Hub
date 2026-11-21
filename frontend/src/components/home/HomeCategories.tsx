"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories, type CategoryRecord } from "@/lib/api";

export default function HomeCategories() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then(({ categories: records }) => { if (active) setCategories(records); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load service categories.");
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="category-grid">
      {categories.map((category) => (
        <Link className="category-card" href={`/services/${category.slug}`} key={category._id}>
          <span
            className="category-image"
            style={category.service.image ? { backgroundImage: `url("${category.service.image}")` } : undefined}
          />
          <strong>{category.name}</strong>
          <span>{category.service.description}</span>
        </Link>
      ))}
      {!categories.length && error && <p className="services-error" role="alert">{error}</p>}
    </div>
  );
}
