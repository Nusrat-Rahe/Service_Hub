import type { ReactNode } from "react";
import Link from "next/link";

type AuthPageProps = {
  eyebrow: string;
  title: string;
  titleId: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  accountPrompt: string;
  accountLinkText: string;
  accountHref: string;
  note: string;
};

export default function AuthPage({
  eyebrow,
  title,
  titleId,
  description,
  icon,
  children,
  accountPrompt,
  accountLinkText,
  accountHref,
  note,
}: AuthPageProps) {
  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <Link className="brand" href="/" aria-label="ServiceHub home">
          <span className="brand-mark" aria-hidden="true">
            ⌂
          </span>
          ServiceHub
        </Link>
        <Link className="auth-home-link" href="/">
          Back to home
        </Link>
      </div>

      <section className="auth-content" aria-labelledby={titleId}>
        <div className="auth-card">
          <div className="auth-heading">
            <span className="auth-icon" aria-hidden="true">
              {icon}
            </span>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id={titleId}>{title}</h1>
            <p>{description}</p>
          </div>

          {children}

          <p className="auth-signup">
            {accountPrompt} <Link href={accountHref}>{accountLinkText}</Link>
          </p>
        </div>
        <p className="auth-note">{note}</p>
      </section>
    </main>
  );
}
