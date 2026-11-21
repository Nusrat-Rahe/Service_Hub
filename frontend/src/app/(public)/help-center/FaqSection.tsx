"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How can I book a service?",
    answer:
      "Browse Services, choose the service you need, and select a preferred appointment time. Sign in with a customer account, provide the service address, then choose a payment method to complete your request.",
  },
  {
    question: "How can I cancel my booking?",
    answer:
      "Open My Bookings and select the booking you want to cancel. Customers can cancel pending bookings that do not have a payment record. If a payment record exists, contact our support team for help.",
  },
  {
    question: "How can I contact a service provider?",
    answer:
      "For help with a provider or an existing booking, send our support team a message and include your booking reference. We can help direct your request to the right team.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "You can choose bKash, Card, or Cash on Delivery. bKash and Card are simulated for this academic project and do not make real transactions or require payment details. Cash on Delivery remains pending until payment is received.",
  },
  {
    question: "Is there any refund policy?",
    answer:
      "Refund requests are reviewed based on the booking and payment circumstances. Contact support with your booking reference so the team can review your request.",
  },
  {
    question: "How can I track my booking?",
    answer:
      "Sign in and open My Bookings to see your booking status, appointment details, and service information.",
  },
];

export default function FaqSection({ query }: { query: string }) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return faqs
      .map((faq, index) => ({ ...faq, index }))
      .filter(
        ({ question, answer }) =>
          !normalizedQuery ||
          `${question} ${answer}`.toLowerCase().includes(normalizedQuery),
      );
  }, [query]);

  return (
    <section className="scroll-mt-24 py-8 md:py-12" id="faq">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Answers and guidance
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          {filteredFaqs.length ? (
            filteredFaqs.map(({ question, answer, index }) => {
              const isOpen = openQuestion === index;
              const answerId = `help-faq-answer-${index}`;
              return (
                <article key={question}>
                  <h3>
                    <button
                      aria-controls={answerId}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-sm font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface)] sm:px-6 sm:text-base"
                      onClick={() => setOpenQuestion(isOpen ? null : index)}
                      type="button"
                    >
                      <span>{question}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`shrink-0 text-[var(--color-primary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                        size={19}
                      />
                    </button>
                  </h3>
                  <div
                    className="px-5 pb-5 text-sm leading-7 text-[var(--color-muted)] sm:px-6"
                    hidden={!isOpen}
                    id={answerId}
                  >
                    {answer}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="grid justify-items-center gap-3 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                No results found
              </p>
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                href="#contact-support"
              >
                Contact Us
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
