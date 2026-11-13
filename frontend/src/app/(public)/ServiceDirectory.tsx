"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getServices, type ServiceRecord } from "@/lib/api";
import { formatMoney } from "@/lib/money";

const serviceImages: Record<string, string> = {
  cleaning: "/images/services/cleaning.jpg",
  plumbing: "/images/services/plumbing.jpg",
  electrical: "/images/services/electrical.jpg",
  "ac repair": "/images/services/ac-repair.jpg",
  painting: "/images/services/painting.png",
  "pest control": "/images/services/pest%20control.jpg",
  "appliance repair": "/images/services/applience%20repair.jpeg",
  "moving & shifting": "/images/services/moving%20%26%20shifting.png",
};

function ServiceDirectoryContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const query = searchParams.get("q") ?? "";
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getServices()
      .then(({ services: records }) => { if (active) setServices(records); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load services."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedCategory = category.trim().toLocaleLowerCase();
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return services.filter((service) => {
      const matchesCategory =
        !normalizedCategory ||
        service.name.toLocaleLowerCase() === normalizedCategory ||
        service.category.toLocaleLowerCase() === normalizedCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${service.name} ${service.category} ${service.description}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, services]);

  const categories = [...new Set(services.map((service) => service.name))];

  return (
    <main className="services-page">
      <section className="services-hero">
        <div className="container services-hero-content">
          <span className="eyebrow">ServiceHub directory</span>
          <h1>Find the right help for your home.</h1>
          <p>From everyday fixes to a fresh new look, explore services and find the right place to start.</p>
          <form className="services-search" action="/services">
            <label className="sr-only" htmlFor="services-search">Search services</label>
            <span className="services-search-icon" aria-hidden="true">⌕</span>
            <input id="services-search" name="q" defaultValue={query} placeholder="Try “cleaning” or “repairs”" />
            {category && <input type="hidden" name="category" value={category} />}
            <button className="button" type="submit">Search</button>
          </form>
          <div className="services-trust"><span>✓ Explore services by category</span><span>✓ Find the help your home needs</span></div>
        </div>
      </section>

      <section className="container services-content">
        <div className="services-heading"><div><span className="eyebrow">Browse our services</span><h2>{category ? `${category} services` : "What can we help with?"}</h2><p>{isLoading ? "Loading available services…" : error || `${filteredServices.length} ${filteredServices.length === 1 ? "service" : "services"} available`}</p></div>{(category || query) && <Link className="services-clear" href="/services">Clear filters</Link>}</div>
        <nav className="services-filters" aria-label="Filter by category">
          <Link className={`services-filter${!category ? " is-active" : ""}`} href="/services" aria-current={!category ? "page" : undefined}>All services</Link>
          {categories.map((name) => {
            const active = name.toLocaleLowerCase() === category.toLocaleLowerCase();
            return <Link className={`services-filter${active ? " is-active" : ""}`} href={`/services?category=${encodeURIComponent(name)}`} key={name} aria-current={active ? "page" : undefined}>{name}</Link>;
          })}
        </nav>
        {error ? <div className="services-empty"><h3>Services are temporarily unavailable</h3><p>{error}</p></div> : filteredServices.length ? (
          <div className="services-grid">{filteredServices.map((service) => {
            const serviceKey = service.name.toLocaleLowerCase();
            const image = serviceImages[serviceKey];
            return (
              <Link className={`service-tile${image ? " has-image" : ""}`} href={`/services/${service._id}`} key={service._id}>
                {image ? (
                  <span className="service-tile-image" style={{ backgroundImage: `url("${image}")` }} />
                ) : null}
                <span className="service-tile-arrow" aria-hidden="true">↗</span>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <span className="service-tile-link">From {formatMoney(service.price)} <span aria-hidden="true">→</span></span>
              </Link>
            );
          })}</div>
        ) : !isLoading ? <div className="services-empty"><span aria-hidden="true">⌕</span><h3>{services.length ? "No services found" : "No services are available yet"}</h3><p>{services.length ? "Try a different search term or view all services." : "Please check back soon."}</p><Link className="button" href="/services">View all services</Link></div> : null}
      </section>
    </main>
  );
}

export default function ServiceDirectory() {
  return <Suspense fallback={<main className="services-page"><div className="container services-content">Loading services…</div></main>}><ServiceDirectoryContent /></Suspense>;
}
