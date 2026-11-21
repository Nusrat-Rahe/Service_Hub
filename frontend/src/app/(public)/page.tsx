import Link from "next/link";
import HomeSearch from "@/components/layout/HomeSearch";
import HomeCategories from "@/components/home/HomeCategories";
import { PopularServices, WhyChooseUs } from "@/components/home/HomeSections";
import { ReviewTestimonials } from "@/components/reviews/ReviewTestimonials";

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
        <HomeCategories />
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
      <WhyChooseUs id="why-choose-us" />
      <PopularServices id="popular-services" />
      <ReviewTestimonials />
    </>
  );
}