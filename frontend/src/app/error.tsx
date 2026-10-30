"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container" style={{ paddingBlock: 64 }}>
      <h1>Something went wrong</h1>
      <p>Please try again.</p>
      <button className="button" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}