import Link from "next/link";
import { House } from "lucide-react";

const footerSections = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Cleaning", href: "/services?category=Cleaning" },
      { label: "AC Repair", href: "/services?category=AC%20Repair" },
      { label: "Plumbing", href: "/services?category=Plumbing" },
      { label: "Electrical", href: "/services?category=Electrical" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-[#103d32] text-white">
      <div className="container">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] lg:gap-x-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              aria-label="ServiceHub home"
              className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9de3c6]"
              href="/"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#9de3c6]">
                <House aria-hidden="true" size={21} strokeWidth={2.2} />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Service<span className="text-[#9de3c6]">Hub</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
              Trusted home services, made simple. We help make every home a
              little better.
            </p>
          </div>

          {footerSections.map((section) => {
              return (
                <section key={section.title}>
                  <h2 className="mb-5 text-sm font-bold tracking-wide text-white">
                    {section.title}
                  </h2>
                  <nav aria-label={section.title}>
                    <ul className="grid justify-items-start gap-3 text-sm text-white/70">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            className="inline-flex items-center rounded-sm transition-colors hover:text-[#9de3c6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9de3c6]"
                            href={link.href}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </nav>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span>© 2026 ServiceHub. All rights reserved.</span>
          <span>Making Homes Better, Together.</span>
        </div>
      </div>
    </footer>
  );
}
