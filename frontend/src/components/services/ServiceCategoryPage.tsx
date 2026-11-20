import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@/lib/service-categories";

export default function ServiceCategoryPage({ category }: { category: ServiceCategory }) {
  return (
    <main className="service-category-page">
      <div className="container">
        <Link className="service-detail-back" href="/services">
          <ArrowLeft size={16} /> All services
        </Link>
        <header className="service-category-heading">
          <span className="eyebrow">{category.serviceName}</span>
          <h1>{category.heading}</h1>
          <p>Select the type of service that best suits your needs.</p>
        </header>
        <div className="service-category-grid">
          {category.types.map((serviceType) => (
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
      </div>
    </main>
  );
}
