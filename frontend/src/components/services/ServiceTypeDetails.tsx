"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getCategory, type CategoryRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";

export default function ServiceTypeDetails() {
  return (
    <Suspense fallback={<main className="service-detail-page"><div className="container">Loading service details…</div></main>}>
      <ServiceTypeDetailsContent />
    </Suspense>
  );
}

function ServiceTypeDetailsContent() {
  const { serviceId, serviceType } = useParams<{ serviceId: string; serviceType: string }>();
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCategory(serviceId)
      .then(({ category: record }) => { if (active) setCategory(record); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this service type.");
      });
    return () => { active = false; };
  }, [serviceId]);

  const selectedType = category?.subcategories.find((type) => type.slug === serviceType);

  if (!category || !selectedType) {
    return (
      <main className="service-detail-page">
        <div className="container">
          <Link className="service-detail-back" href="/services"><ArrowLeft size={16} /> All services</Link>
          <section className="service-detail-card">
            <span className="eyebrow">{error || category ? "Service unavailable" : "Loading service details"}</span>
            <h1>{error || (category ? "Service type not found" : "Please wait…")}</h1>
            <p>{error || (category ? "Choose an available service type to view its details." : "Loading details from ServiceHub.")}</p>
            {category && <Link className="button" href={`/services/${category.slug}`}>View {category.name} services</Link>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="service-detail-page">
      <div className="container">
        <Link className="service-detail-back" href={`/services/${category.slug}`}>
          <ArrowLeft size={16} /> {category.name} services
        </Link>
        <section className="service-detail-card service-type-detail-card">
          <span className="eyebrow">{category.name}</span>
          <h1>{selectedType.name}</h1>
          <p>{selectedType.description}</p>

          {selectedType.includes.length > 0 && (
            <section className="service-type-detail-section" aria-labelledby="service-type-includes-heading">
              <h2 id="service-type-includes-heading">What’s included</h2>
              <ul className="service-type-includes">
                {selectedType.includes.map((item) => (
                  <li key={item}><CheckCircle2 size={17} />{item}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="service-type-meta">
            {selectedType.duration && <div><span>Estimated duration</span><strong>{selectedType.duration}</strong></div>}
            <div>
              <span>Price information</span>
              <strong>{`${category.name} from ${formatMoney(category.service.price)}`}</strong>
              <small>Displayed rate is for the main service; final price depends on the selected work and its requirements.</small>
            </div>
          </div>
          <Link
            className="button service-type-book-now"
            href={`/services/${category.service._id}/book?categoryId=${encodeURIComponent(category._id)}&subcategoryId=${encodeURIComponent(selectedType._id)}`}
          >
            Book Now <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
