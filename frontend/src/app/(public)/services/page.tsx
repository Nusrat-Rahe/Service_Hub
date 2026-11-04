import { Suspense } from "react";
import Link from "next/link";

const services = [
  {
    name: "Cleaning",
    icon: "🧹",
    description: "A fresh, comfortable home, from regular upkeep to deep cleans.",
  },
  {
    name: "Plumbing",
    icon: "🔧",
    description: "Get help with leaks, fittings, drainage and everyday repairs.",
  },
  {
    name: "Electrical",
    icon: "💡",
    description: "Find help for lighting, wiring and household electrical work.",
  },
  {
    name: "AC Repair",
    icon: "❄️",
    description: "Keep your air conditioning running smoothly all year.",
  },
  {
    name: "Painting",
    icon: "🎨",
    description: "Refresh your walls and rooms with a clean new finish.",
  },
  {
    name: "Pest Control",
    icon: "🐜",
    description: "Keep unwanted pests out and make your home comfortable.",
  },
  {
    name: "Appliance Repair",
    icon: "🛠️",
    description: "Get your essential household appliances back in shape.",
  },
  {
    name: "Moving & Shifting",
    icon: "🚚",
    description: "Make packing, moving and settling into your new place easier.",
  },
];

type ServicesPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

async function ServicesDirectory({
  searchParams,
}: ServicesPageProps) {
  const { category = "", q = "" } = await searchParams;
  const normalizedCategory = category.trim().toLocaleLowerCase();
  const normalizedQuery = q.trim().toLocaleLowerCase();
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      !normalizedCategory ||
      service.name.toLocaleLowerCase() === normalizedCategory;
    const matchesQuery =
      !normalizedQuery ||
      `${service.name} ${service.description}`
        .toLocaleLowerCase()
        .includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
    <main className="services-page">
      <section className="services-hero">
        <div className="container services-hero-content">
          <span className="eyebrow">ServiceHub directory</span>
          <h1>Find the right help for your home.</h1>
          <p>
            From everyday fixes to a fresh new look, explore services and find
            the right place to start.
          </p>
          <form className="services-search" action="/services">
            <label className="sr-only" htmlFor="services-search">
              Search services
            </label>
            <span className="services-search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id="services-search"
              name="q"
              defaultValue={q}
              placeholder="Try “cleaning” or “repairs”"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button className="button" type="submit">
              Search
            </button>
          </form>
          <div className="services-trust">
            <span>✓ Explore services by category</span>
            <span>✓ Find the help your home needs</span>
          </div>
        </div>
      </section>

      <section className="container services-content">
        <div className="services-heading">
          <div>
            <span className="eyebrow">Browse our services</span>
            <h2>{category ? `${category} services` : "What can we help with?"}</h2>
            <p>
              {filteredServices.length
                ? `${filteredServices.length} ${
                    filteredServices.length === 1 ? "category" : "categories"
                  } to explore`
                : "No matching services found. Try another search or category."}
            </p>
          </div>
          {(category || q) && (
            <Link className="services-clear" href="/services">
              Clear filters
            </Link>
          )}
        </div>

        <nav className="services-filters" aria-label="Filter by category">
          <Link
            className={`services-filter${!category ? " is-active" : ""}`}
            href="/services"
            aria-current={!category ? "page" : undefined}
          >
            All services
          </Link>
          {services.map((service) => {
            const isActive =
              service.name.toLocaleLowerCase() === normalizedCategory;
            const href = `/services?category=${encodeURIComponent(service.name)}`;

            return (
              <Link
                className={`services-filter${isActive ? " is-active" : ""}`}
                href={href}
                key={service.name}
                aria-current={isActive ? "page" : undefined}
              >
                {service.name}
              </Link>
            );
          })}
        </nav>

        {filteredServices.length ? (
          <div className="services-grid">
            {filteredServices.map((service) => {
              const isActive =
                service.name.toLocaleLowerCase() === normalizedCategory;

              return (
                <Link
                  className="service-tile"
                  href={`/services?category=${encodeURIComponent(service.name)}`}
                  key={service.name}
                  aria-label={`Browse ${service.name} services`}
                >
                  <span className="service-tile-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <span className="service-tile-arrow" aria-hidden="true">
                    ↗
                  </span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <span className="service-tile-link">
                    {isActive ? "Viewing category" : "Explore category"}
                    <span aria-hidden="true"> →</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="services-empty">
            <span aria-hidden="true">⌕</span>
            <h3>No services found</h3>
            <p>Try a different search term or view all service categories.</p>
            <Link className="button" href="/services">
              View all services
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ServicesPage(props: ServicesPageProps) {
  return (
    <Suspense
      fallback={
        <main className="services-page" aria-busy="true">
          <div className="container services-content">Loading services...</div>
        </main>
      }
    >
      <ServicesDirectory searchParams={props.searchParams} />
    </Suspense>
  );
}