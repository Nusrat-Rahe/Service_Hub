import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | ServiceHub",
  description: "Read the Terms & Conditions for using ServiceHub.",
};

const termsSections = [
  {
    title: "Account Registration",
    items: [
      "Users must provide accurate and complete information during registration.",
      "Users are responsible for maintaining the security of their accounts.",
      "Each user should use their own registered account.",
      "ServiceHub reserves the right to restrict accounts involved in misuse or suspicious activities.",
    ],
  },
  {
    title: "Service Booking",
    items: [
      "Customers can book available home services through ServiceHub.",
      "Customers must provide accurate contact information and service addresses.",
      "Booking confirmation depends on service availability.",
      "Customers should review booking details before confirming their requests.",
    ],
  },
  {
    title: "Booking Cancellation",
    items: [
      "Customers may cancel bookings according to the available cancellation options.",
      "Customers should cancel as early as possible if they no longer require a service.",
      "ServiceHub may restrict repeated misuse of the cancellation system.",
    ],
  },
  {
    title: "Payment Policy",
    items: [
      "Customers must pay the service charges displayed during booking.",
      "bKash and Card selections are simulated for this academic project; they do not make real transactions or request payment credentials.",
      "Cash on Delivery payments must be completed after receiving the service.",
      "Customers should keep their payment receipts for future reference.",
    ],
  },
  {
    title: "Customer Responsibilities",
    items: [
      "Customers must provide correct booking and contact information.",
      "Customers should ensure a safe environment for service providers.",
      "Customers must communicate respectfully with service providers.",
      "Customers should report any service-related problems to ServiceHub.",
    ],
  },
  {
    title: "Service Provider Responsibilities",
    items: [
      "Service providers are expected to perform services professionally.",
      "Providers should arrive at the scheduled time or inform customers about delays.",
      "Providers must respect customer privacy and property.",
      "Providers should maintain appropriate behavior while providing services.",
    ],
  },
  {
    title: "Refund Policy",
    items: [
      "Refund requests must be submitted through the appropriate support channel.",
      "Refund eligibility depends on the circumstances of the booking and payment.",
      "Approved refunds will be processed through the applicable payment method or agreed process.",
      "ServiceHub reserves the right to review refund requests before approval.",
    ],
  },
  {
    title: "Service Quality",
    items: [
      "ServiceHub aims to provide a convenient and reliable home service booking experience.",
      "Service quality may depend on the selected service provider.",
      "Customers can report unsatisfactory experiences through the support team.",
    ],
  },
  {
    title: "Limitation of Liability",
    items: [
      "ServiceHub acts as a platform connecting customers with home service providers.",
      "ServiceHub is not responsible for inaccurate information provided by users.",
      "Any service-related complaints should be reported to the ServiceHub support team for review.",
    ],
  },
  {
    title: "Changes to Terms & Conditions",
    items: [
      "ServiceHub may update these Terms & Conditions when necessary.",
      "Updated terms will be published on this page.",
      "Continued use of the platform after updates means acceptance of the revised terms, subject to applicable law.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <article className="terms-policy-page">
      <div className="terms-policy-container">
        <header className="terms-policy-header">
          <p className="eyebrow">ServiceHub</p>
          <h1>Terms &amp; Conditions</h1>
          <p className="terms-policy-updated">
            Last Updated: November 19, 2026
          </p>
          <p className="terms-policy-introduction">
            Welcome to ServiceHub! These Terms &amp; Conditions explain the
            rules and guidelines for using our platform. By accessing or using
            ServiceHub, you agree to follow these terms.
          </p>
        </header>

        <div className="terms-policy-content">
          {termsSections.map((section, index) => (
            <section className="terms-policy-section" key={section.title}>
              <h2>
                <span className="terms-policy-section-number">{index + 1}</span>
                <span>{section.title}</span>
              </h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="terms-policy-section" id="terms-contact">
            <h2>
              <span className="terms-policy-section-number">11</span>
              <span>Contact Us</span>
            </h2>
            <p>
              If you have any questions, concerns, or complaints regarding these
              Terms &amp; Conditions, please contact our support team.
            </p>
            <dl className="terms-policy-contact">
              <div>
                <dt>Platform</dt>
                <dd>ServiceHub</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href="mailto:support@servicehub.com">
                    support@servicehub.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>ServiceHub</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </article>
  );
}
