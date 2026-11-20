"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchQuery = query.trim();
    setQuery("");
    router.push(searchQuery ? `/services?q=${encodeURIComponent(searchQuery)}` : "/services");
  }

  return (
    <form className="search-form" action="/services" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="service-search">
        Search home services
      </label>
      <input
        id="service-search"
        name="q"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What service do you need?"
        value={query}
      />
      <button className="button" type="submit">
        Find a service
      </button>
    </form>
  );
}
