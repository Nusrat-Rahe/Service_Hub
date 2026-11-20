"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getServices, type ServiceRecord } from "@/lib/api";
import { serviceCategories } from "@/lib/service-categories";
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
  const category = serviceCategories[serviceId];
  const selectedType = category?.types.find((type) => type.slug === serviceType);
  const [bookingInfo, setBookingInfo] = useState<{
    categorySlug: string;
    service: ServiceRecord | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!category) return;
    let active = true;
    getServices()
      .then(({ services }) => {
        const record = services.find((item) => item.name.toLocaleLowerCase() === category.serviceName.toLocaleLowerCase());
        if (active) {
          setBookingInfo({
            categorySlug: category.slug,
            service: record ?? null,
            error: record ? "" : `The ${category.serviceName} service is currently unavailable for booking.`,
          });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setBookingInfo({
            categorySlug: category.slug,
            service: null,
            error: requestError instanceof Error ? requestError.message : "Could not load booking information.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [category]);

  const currentBookingInfo =
    bookingInfo?.categorySlug === category?.slug ? bookingInfo : null;
  const matchingService = currentBookingInfo?.service ?? null;

  if (!category || !selectedType) {
    return (
      <main className="service-detail-page">
        <div className="container">
          <Link className="service-detail-back" href="/services">
            <ArrowLeft size={16} /> All services
          </Link>
          <section className="service-detail-card">
            <span className="eyebrow">Service unavailable</span>
            <h1>Service type not found</h1>
            <p>Choose an available service type to view its details.</p>
            {category && <Link className="button" href={`/services/${category.slug}`}>View {category.serviceName} services</Link>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="service-detail-page">
      <div className="container">
        <Link className="service-detail-back" href={`/services/${category.slug}`}>
          <ArrowLeft size={16} /> {category.serviceName} services
        </Link>
        <section className="service-detail-card service-type-detail-card">
          <span className="eyebrow">{category.serviceName}</span>
          <h1>{selectedType.name}</h1>
          <p>{selectedType.description}</p>

          <section className="service-type-detail-section" aria-labelledby="service-type-includes-heading">
            <h2 id="service-type-includes-heading">What’s included</h2>
            <ul className="service-type-includes">
              {selectedType.includes.map((item) => (
                <li key={item}><CheckCircle2 size={17} />{item}</li>
              ))}
            </ul>
          </section>

          <div className="service-type-meta">
            <div>
              <span>Estimated duration</span>
              <strong>{selectedType.duration}</strong>
            </div>
            <div>
              <span>Price information</span>
              <strong>{matchingService ? `${category.serviceName} from ${formatMoney(matchingService.price)}` : "Quote confirmed when reviewing your request"}</strong>
              <small>Displayed rate is for the main service; final price depends on the selected work and its requirements.</small>
            </div>
          </div>
          {currentBookingInfo?.error && <p className="service-type-error" role="alert">{currentBookingInfo.error}</p>}
          {matchingService ? (
            <Link className="button service-type-book-now" href={`/services/${matchingService._id}/book`}>
              Book Now <ArrowRight size={16} />
            </Link>
          ) : (
            <button className="button service-type-book-now" disabled type="button">Book Now</button>
          )}
        </section>
      </div>
    </main>
  );
}
