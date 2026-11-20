"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CircleHelp,
  Headset,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { sendSupportMessage } from "@/lib/api";
import FaqSection from "./FaqSection";

const inputClassName =
  "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10";

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery("");
    document.getElementById("faq")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const { message } = await sendSupportMessage({
        fullName: String(formData.get("fullName") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      });
      form.reset();
      setFormStatus({ kind: "success", message });
    } catch (error) {
      setFormStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pb-16">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container grid items-center gap-10 py-14 md:min-h-[350px] md:grid-cols-[1.25fr_0.75fr] md:py-20">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
              ServiceHub Support
            </p>
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-5xl">
              How can we help you?
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Find answers or get support from our team.
            </p>
            <form
              className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--color-primary)]/10"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-2">
                <Search aria-hidden="true" className="shrink-0 text-[var(--color-primary)]" size={20} />
                <span className="sr-only">Search frequently asked questions</span>
                <input
                  className="min-h-11 w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for help..."
                  type="search"
                  value={query}
                />
              </label>
              <button
                className="min-h-11 shrink-0 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                type="submit"
              >
                Search
              </button>
            </form>
          </div>
          <div
            aria-hidden="true"
            className="relative mx-auto hidden aspect-square w-full max-w-[270px] place-items-center rounded-[2rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgb(24_51_42_/_8%)] md:grid"
          >
            <div className="absolute inset-5 rounded-[1.5rem] bg-[var(--color-surface)]" />
            <div className="relative grid size-28 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20">
              <Headset size={54} strokeWidth={1.6} />
            </div>
            <span className="absolute bottom-8 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--color-ink)] shadow-sm">
              Here when you need us
            </span>
          </div>
        </div>
      </section>

      <div className="container">
        <section
          aria-label="Help options"
          className="grid gap-5 py-10 md:grid-cols-2 md:py-14"
        >
          <article className="flex flex-col items-start rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_35px_rgb(24_51_42_/_5%)] sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-[var(--color-surface)] text-[var(--color-primary)]">
              <CircleHelp aria-hidden="true" size={25} />
            </span>
            <h2 className="mt-5 text-xl font-bold text-[var(--color-ink)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--color-muted)]">
              Find quick answers to common questions about our services.
            </p>
            <a
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              href="#faq"
            >
              Browse FAQs
            </a>
          </article>

          <article className="flex flex-col items-start rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_12px_35px_rgb(24_51_42_/_5%)] sm:p-8">
            <span className="grid size-12 place-items-center rounded-xl bg-[var(--color-surface)] text-[var(--color-primary)]">
              <MessageSquareText aria-hidden="true" size={24} />
            </span>
            <h2 className="mt-5 text-xl font-bold text-[var(--color-ink)]">
              Contact Support
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--color-muted)]">
              Need more help? Contact our support team.
            </p>
            <a
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-primary)] px-5 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              href="#contact-support"
            >
              Contact Us
            </a>
          </article>
        </section>

        <FaqSection query={query} />

        <section
          className="scroll-mt-24 py-8 md:py-12"
          id="contact-support"
        >
          <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_18px_55px_rgb(24_51_42_/_7%)] md:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-[var(--color-primary)] p-6 text-white sm:p-7">
              <span className="grid size-12 place-items-center rounded-xl bg-white/15">
                <Headset aria-hidden="true" size={25} />
              </span>
              <h2 className="mt-5 text-2xl font-bold">Contact Support</h2>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Tell us how we can help. Include your booking reference if your
                question is about a service request.
              </p>
              <div className="mt-6 grid justify-items-start gap-3">
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
                  href="mailto:support@servicehub.com"
                >
                  <Mail aria-hidden="true" size={16} />
                  support@servicehub.com
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
                  href="tel:+8801711211555"
                >
                  <Phone aria-hidden="true" size={16} />
                  01711211555
                </a>
              </div>
            </div>

            <form
              className="grid gap-4 p-6 sm:p-7"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  Full Name
                  <input
                    autoComplete="name"
                    className={inputClassName}
                    maxLength={100}
                    name="fullName"
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  Email Address
                  <input
                    autoComplete="email"
                    className={inputClassName}
                    maxLength={254}
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                  />
                </label>
              </div>
              <label className="text-sm font-semibold text-[var(--color-ink)]">
                Subject
                <input
                  className={inputClassName}
                  maxLength={160}
                  name="subject"
                  placeholder="What do you need help with?"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-[var(--color-ink)]">
                Message
                <textarea
                  className={`${inputClassName} min-h-28 resize-y`}
                  maxLength={3000}
                  name="message"
                  placeholder="Share a few details so we can help."
                  required
                  rows={4}
                />
              </label>
              {formStatus && (
                <p
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                    formStatus.kind === "success"
                      ? "bg-[var(--color-surface)] text-[var(--color-primary-dark)]"
                      : "bg-red-50 text-red-700"
                  }`}
                  role={formStatus.kind === "error" ? "alert" : "status"}
                >
                  {formStatus.kind === "success" && (
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
                  )}
                  {formStatus.message}
                </p>
              )}
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <Send aria-hidden="true" size={16} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
