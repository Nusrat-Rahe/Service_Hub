import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="container" style={{ paddingBlock: 64 }}>
      <p className="eyebrow">404 · Page not found</p>
      <h1>We could not find that page.</h1>
      <Link className="button" href="/">
        Return home
      </Link>
    </main>
  );
}