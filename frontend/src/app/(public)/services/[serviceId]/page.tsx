"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import ServiceCategoryPage from "@/components/services/ServiceCategoryPage";
import { getCategories, getService, type ServiceRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";

export default function ServiceDetailsPage() {
  return <Suspense fallback={<main className="service-detail-page"><div className="container">Loading service details…</div></main>}><ServiceDetailsContent /></Suspense>;
}

function ServiceDetailsContent() {
  const params = useParams<{ serviceId: string }>();
  const isServiceId = /^[a-f\d]{24}$/i.test(params.serviceId);
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [categorySlug, setCategorySlug] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (isServiceId) {
      Promise.all([getService(params.serviceId), getCategories()])
        .then(([{ service: record }, { categories }]) => {
          if (!active) return;
          setService(record);
          setCategorySlug(categories.find((category) => category.service._id === record._id)?.slug ?? "");
        })
        .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this service."); });
    }
    return () => { active = false; };
  }, [isServiceId, params.serviceId]);

  if (!isServiceId) return <ServiceCategoryPage slug={params.serviceId} />;

  return (
    <main className="service-detail-page">
      <div className="container">
        <Link className="service-detail-back" href="/services"><ArrowLeft size={16} /> All services</Link>
        {error ? <section className="service-detail-card"><span className="eyebrow">Service unavailable</span><h1>{error}</h1><p>This service may have been removed or is temporarily unavailable.</p><Link className="button" href="/services">Browse services</Link></section> : service ? <section className="service-detail-card"><span className="service-detail-icon">⌂</span><span className="eyebrow">{service.category}</span><h1>{service.name}</h1><p>{service.description}</p><div className="service-detail-price"><span>Starting from</span><strong>{formatMoney(service.price)}</strong></div><div className="service-detail-points"><span><CheckCircle2 size={16} /> Clear pricing before you book</span><span><CheckCircle2 size={16} /> Request a convenient appointment</span><span><CheckCircle2 size={16} /> Track your request online</span></div><Link className="button" href={categorySlug ? `/services/${categorySlug}` : `/services/${service._id}/book`}>{categorySlug ? "Explore service types" : "Request this service"} <ArrowRight size={16} /></Link></section> : <section className="service-detail-card" aria-busy="true">Loading service details…</section>}
      </div>
    </main>
  );
}
