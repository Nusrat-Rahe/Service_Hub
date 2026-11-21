"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarCheck2, House, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getPopularServices, type PopularServiceRecord } from "@/lib/api";

const reasons = [
  {
    title: "Trusted Professionals",
    description: "Reliable professionals for your home service needs.",
    Icon: ShieldCheck,
  },
  {
    title: "Transparent Pricing",
    description: "Clear and fixed prices with no hidden surprises.",
    Icon: Wallet,
  },
  {
    title: "Easy Booking",
    description: "Book your required home service with just a few clicks.",
    Icon: CalendarCheck2,
  },
  {
    title: "All-in-One Platform",
    description: "Find multiple home services in one convenient place.",
    Icon: House,
  },
];

export function WhyChooseUs({ id }: { id: string }) {
  return (
    <section className="why-choose-section" id={id}>
      <div className="container">
        <div className="home-feature-heading">
          <span className="home-feature-eyebrow">WHY CHOOSE US</span>
          <h2>Why Choose ServiceHub?</h2>
          <p>Your trusted partner for all home service needs.</p>
        </div>
        <div className="why-choose-grid">
          {reasons.map(({ title, description, Icon }) => (
            <article className="why-choose-card" key={title}>
              <span className="why-choose-icon"><Icon aria-hidden="true" size={23} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularServices({ id }: { id: string }) {
  const [services, setServices] = useState<PopularServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    getPopularServices()
      .then(({ services: popularServices }) => {
        if (active) setServices(popularServices);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Could not load popular services.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="popular-services-section" id={id}>
      <div className="container">
        <div className="home-feature-heading">
          <span className="home-feature-eyebrow">CUSTOMER FAVORITES</span>
          <h2>Popular Services</h2>
          <p>Explore our most booked home services.</p>
        </div>
        {isLoading ? (
          <p className="popular-services-message" role="status">Loading popular services…</p>
        ) : error ? (
          <p className="popular-services-message" role="status">Popular services are unavailable right now. {error}</p>
        ) : services.length === 0 ? (
          <p className="popular-services-message">Popular services will appear here as bookings are completed.</p>
        ) : (
          <div className="popular-services-grid">
            {services.map((service) => (
              <Link className="popular-service-card" href={`/services/${service._id}`} key={service._id}>
                <span className="popular-service-image">
                  {service.image && !failedImages.has(service._id) ? (
                    <Image
                      alt={service.name}
                      fill
                      onError={() => setFailedImages((current) => new Set(current).add(service._id))}
                      sizes="(max-width: 600px) 100vw, (max-width: 800px) 50vw, 33vw"
                      src={service.image}
                      unoptimized
                    />
                  ) : null}
                </span>
                <span className="popular-service-copy">
                  <strong>{service.name}</strong>
                  <span className="popular-service-description">{service.description}</span>
                  <span className="popular-service-link">Explore <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
