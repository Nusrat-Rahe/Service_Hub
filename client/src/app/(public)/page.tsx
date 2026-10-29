import Link from "next/link";

const categories = [
  { name: "Cleaning", icon: "🧹", description: "A fresh, comfortable home" },
  { name: "Plumbing", icon: "🔧", description: "Repairs, leaks and fittings" },
  { name: "Electrical", icon: "💡", description: "Safe help around the home" },
  { name: "AC repair", icon: "❄️", description: "Servicing and maintenance" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow">Trusted help for your home</span>
          <h1>
            Home services,
            <br />
            <span>made simpler.</span>
          </h1>
          <p>
            Browse cleaning, repairs and more, then send your service request
            directly to the ServiceHub admin team.
          </p>
          <form className="search-form" action="/services">
            <label className="sr-only" htmlFor="service-search">
              Search home services
            </label>
            <input
              id="service-search"
              name="q"
              placeholder="What service do you need?"
            />
            <button className="button" type="submit">
              Find a service
            </button>
          </form>
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
          {categories.map((category) => (
            <Link
              className="category-card"
              href={`/services?category=${encodeURIComponent(category.name)}`}
              key={category.name}
            >
              <span className="category-icon" aria-hidden="true">
                {category.icon}
              </span>
              <strong>{category.name}</strong>
              <span>{category.description}</span>
            </Link>
          ))}
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