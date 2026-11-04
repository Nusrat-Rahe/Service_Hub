import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow">About ServiceHub</span>
          <h1>
            Home services,
            <br />
            <span>made simpler.</span>
          </h1>
          <p>
            ServiceHub helps you find the right home service, send a booking
            request, and keep track of its status from your dashboard.
          </p>
          <Link className="button" href="/services">
            Explore services
          </Link>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">How we help</span>
            <h2>One place to get started</h2>
            <p>
              Browse available services, share the details of your request, and
              follow up as it is reviewed by the ServiceHub team.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
