import Link from "next/link";
import { getServiceCategoryByName } from "@/lib/service-categories";
import HomeSearch from "@/components/layout/HomeSearch";

const categories = [
  { name: "Cleaning", image: "/images/services/cleaning.jpg", description: "A fresh, comfortable home" },
  { name: "Plumbing", image: "/images/services/plumbing.jpg", description: "Repairs, leaks and fittings" },
  { name: "Electrical", image: "/images/services/electrical.jpg", description: "Safe help around the home" },
  { name: "AC repair", image: "/images/services/ac-repair.jpg", description: "Servicing and maintenance" },
  { name: "Painting", image: "/images/services/painting.png", description: "A fresh look for your home" },
  { name: "Pest Control", image: "/images/services/pest%20control.jpg", description: "Keep unwanted pests away" },
  { name: "Appliance Repair", image: "/images/services/applience%20repair.jpeg", description: "Get household appliances working" },
  { name: "Moving & Shifting", image: "/images/services/moving%20%26%20shifting.png", description: "Make your move easier" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow">Trusted help for your home</span>
          <h1>
            Your Home,
            <br />
            <span>Our Responsibility.</span>
          </h1>
          <p>
            Browse cleaning, repairs and more, then book trusted professionals
            directly through ServiceHub.
          </p>
          <HomeSearch />
          <div className="trust-points">
            <span>✓ Service details upfront</span>
            <span>✓ Convenient booking requests</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Explore ServiceHub</span>
            <h2>What do you need help with?</h2>
            <p>Choose a category to explore available services.</p>
          </div>
          <Link className="text-link" href="/services">
            Browse all services →
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => {
            const serviceCategory = getServiceCategoryByName(category.name);
            return (
              <Link
                className="category-card"
                href={serviceCategory ? `/services/${serviceCategory.slug}` : `/services?category=${encodeURIComponent(category.name)}`}
                key={category.name}
              >
                <span className="category-image" style={{ backgroundImage: `url("${category.image}")` }} />
                <strong>{category.name}</strong>
                <span>{category.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <span className="eyebrow">Getting started</span>
          <h2>Book help in three simple steps</h2>
          <div className="steps-grid">
            <article>
              <span>01</span>
              <h3>Choose a service</h3>
              <p>Browse home-service categories and find the right option.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Send a request</h3>
              <p>Share your preferred appointment time and service address.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Track the response</h3>
              <p>Check your request status from your user dashboard.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}