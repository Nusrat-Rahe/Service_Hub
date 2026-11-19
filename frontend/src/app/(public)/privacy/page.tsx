import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ServiceHub",
  description: "Learn how ServiceHub collects, uses, and protects your information.",
};

const privacySections = [
  {
    title: "Information We Collect",
    content:
      "We may collect your name, email address, mobile number, service address, account details, and booking information.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use your information to manage accounts, process bookings, provide services, and communicate important updates.",
  },
  {
    title: "Information Sharing",
    content:
      "We may share relevant booking information with service providers to complete requested services.",
  },
  {
    title: "Data Protection",
    content:
      "We take reasonable measures to protect user information against unauthorized access, misuse, or disclosure.",
  },
  {
    title: "Payment Information",
    content:
      "Payment information is handled according to the selected payment method and applicable payment provider's security practices.",
  },
  {
    title: "Cookies",
    content:
      "Our website may use cookies or similar technologies to improve user experience and website functionality.",
  },
  {
    title: "User Rights",
    content:
      "Users may request access to, correction of, or deletion of their personal information, subject to applicable requirements.",
  },
  {
    title: "Third-Party Services",
    content:
      "External services may have their own privacy policies and data-handling practices.",
  },
  {
    title: "Policy Updates",
    content:
      "We may update this Privacy Policy when necessary. Changes will be published on this page.",
  },
  {
    title: "Contact Us",
    content:
      "For privacy-related questions or concerns, please contact the ServiceHub support team.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="privacy-policy-page">
      <div className="privacy-policy-container">
        <header className="privacy-policy-header">
          <p className="eyebrow">ServiceHub</p>
          <h1>Privacy Policy</h1>
          <span className="privacy-policy-title-rule" aria-hidden="true" />
          <p className="privacy-policy-updated">
            Last Updated: November 19, 2026
          </p>
          <p className="privacy-policy-introduction">
            Your privacy matters to us. This Privacy Policy explains how
            ServiceHub collects, uses, and protects your personal information
            when you use our platform.
          </p>
        </header>

        <div className="privacy-policy-content">
          {privacySections.map((section, index) => (
            <section className="privacy-policy-section" key={section.title}>
              <h2>
                <span className="privacy-policy-section-number">{index + 1}</span>
                <span>{section.title}</span>
              </h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>

        <p className="privacy-policy-signoff">Your Privacy Matters to Us.</p>
      </div>
    </article>
  );
}
