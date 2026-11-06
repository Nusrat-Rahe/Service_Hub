"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Hammer,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Paintbrush,
  PawPrint,
  PlugZap,
  Search,
  Sparkles,
  UserRound,
  WashingMachine,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/lib/auth";
import "./dashboard.css";

const serviceCategories: {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    name: "Cleaning",
    description: "A fresh, comfortable home",
    icon: Sparkles,
    color: "mint",
  },
  {
    name: "Plumbing",
    description: "Leaks, fittings and repairs",
    icon: Wrench,
    color: "blue",
  },
  {
    name: "Electrical",
    description: "Lighting and household wiring",
    icon: PlugZap,
    color: "amber",
  },
  {
    name: "AC Repair",
    description: "Cooling service and maintenance",
    icon: Home,
    color: "lilac",
  },
  {
    name: "Painting",
    description: "Refresh your walls and rooms",
    icon: Paintbrush,
    color: "rose",
  },
  {
    name: "Pest Control",
    description: "Help keep unwanted pests away",
    icon: PawPrint,
    color: "lime",
  },
  {
    name: "Appliance Repair",
    description: "Help with household appliances",
    icon: WashingMachine,
    color: "cyan",
  },
  {
    name: "Moving & Shifting",
    description: "Help with your next move",
    icon: Hammer,
    color: "peach",
  },
];

const navigation: {
  name: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
}[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Browse Services", href: "/services", icon: Search },
  { name: "My Bookings", href: "/user/bookings", icon: CalendarDays, soon: true },
  { name: "Notifications", href: "/user/notifications", icon: Bell, soon: true },
  { name: "Profile", href: "/user/profile", icon: UserRound, soon: true },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Sidebar({
  isOpen,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation menu"
          className="customer-sidebar-backdrop"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        aria-label="Customer navigation"
        className={`customer-sidebar${isOpen ? " is-open" : ""}`}
      >
        <div className="customer-sidebar-brand-row">
          <Link
            aria-label="ServiceHub home"
            className="customer-brand"
            href="/"
            onClick={onClose}
          >
            <span className="customer-brand-icon">
              <Home aria-hidden="true" size={20} strokeWidth={2.2} />
            </span>
            <span>
              Service<span className="customer-brand-accent">Hub</span>
            </span>
          </Link>
          <button
            aria-label="Close navigation menu"
            className="customer-sidebar-close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <p className="customer-sidebar-label">MENU</p>
        <nav className="customer-nav">
          {navigation.map(({ name, href, icon: Icon, soon }) => {
            const active =
              pathname === href ||
              (href !== "/user/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`customer-nav-link${active ? " active" : ""}`}
                href={href}
                key={href}
                onClick={onClose}
              >
                <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                <span>{name}</span>
                {soon && <span className="customer-nav-soon">Soon</span>}
              </Link>
            );
          })}
        </nav>

        <div className="customer-sidebar-bottom">
          <div className="customer-support-card">
            <span className="customer-support-icon">
              <Heart aria-hidden="true" fill="currentColor" size={17} />
            </span>
            <strong>Need a hand?</strong>
            <p>Get in touch with the ServiceHub team.</p>
            <Link href="/#contact" onClick={onClose}>
              Contact us <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
          <button
            className="customer-sidebar-logout"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const query = value.trim();
  const href = query
    ? `/services?q=${encodeURIComponent(query)}`
    : "/services";

  return (
    <div className="customer-search">
      <Search aria-hidden="true" size={19} />
      <input
        aria-label="Search services by category"
        onChange={(event) => onChange(event.target.value)}
        placeholder="What service do you need?"
        type="search"
        value={value}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="customer-search-clear"
          onClick={() => onChange("")}
          type="button"
        >
          <X aria-hidden="true" size={17} />
        </button>
      )}
      <Link className="customer-search-button" href={href}>
        Search
      </Link>
    </div>
  );
}

function CategoryGrid({
  categories,
}: {
  categories: typeof serviceCategories;
}) {
  if (!categories.length) {
    return (
      <p className="customer-no-results">
        No matching categories. Try a different search or browse all services.
      </p>
    );
  }

  return (
    <div className="customer-category-grid">
      {categories.map(({ name, description, icon: Icon, color }) => (
        <Link
          className="customer-category-card"
          href={`/services?category=${encodeURIComponent(name)}`}
          key={name}
        >
          <span className={`customer-category-icon ${color}`}>
            <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
          </span>
          <span className="customer-category-copy">
            <strong>{name}</strong>
            <small>{description}</small>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="customer-category-arrow"
            size={16}
          />
        </Link>
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="customer-section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && href && (
        <Link href={href}>
          {action} <ChevronRight aria-hidden="true" size={16} />
        </Link>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const name = user?.fullName || "there";
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return serviceCategories;
    return serviceCategories.filter(
      ({ name, description }) =>
        `${name} ${description}`.toLowerCase().includes(query),
    );
  }, [search]);

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error("Could not sign out.", error);
    }
  }

  return (
    <div className="customer-dashboard">
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLogout={handleLogout}
      />
      <main className="customer-dashboard-main">
        <header className="customer-header">
          <button
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="customer-mobile-menu"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={21} />
          </button>
          <div className="customer-header-title">
            <span className="customer-date">{today}</span>
            <h1>Dashboard</h1>
          </div>
          <div className="customer-header-actions">
            <div className="customer-user-chip">
              <Link
                aria-label={`View ${name}'s profile`}
                className="customer-user-profile-link"
                href="/user/profile"
              >
                <span aria-hidden="true" className="customer-user-avatar">
                  {getInitials(name)}
                </span>
                <span className="customer-user-copy">
                  <strong>{name}</strong>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <div className="customer-dashboard-content">
          <section aria-label="Browse services" className="customer-search-row">
            <SearchBar onChange={setSearch} value={search} />
            <Link className="customer-book-service-button" href="/services">
              <span className="customer-book-service-icon">
                <Sparkles aria-hidden="true" size={17} />
              </span>
              Browse services
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </section>

          <section aria-labelledby="bookings-title" className="customer-bookings-notice">
            <span className="customer-bookings-notice-icon">
              <CalendarDays aria-hidden="true" size={20} />
            </span>
            <div>
              <span className="customer-notice-label">MY BOOKINGS</span>
              <h2 id="bookings-title">Booking management isn’t available yet</h2>
              <p>
                Booking requests and history aren’t supported in the project
                yet. Once implemented, you’ll be able to track them here.
              </p>
            </div>
            <Clock3
              aria-hidden="true"
              className="customer-bookings-notice-clock"
              size={18}
            />
          </section>

          <section aria-label="Service categories" className="customer-section">
            <SectionHeading
              eyebrow="AVAILABLE IN THE SERVICE DIRECTORY"
              title={
                search ? "Matching service categories" : "Browse service categories"
              }
            />
            <CategoryGrid categories={filteredCategories} />
          </section>

          <section
            aria-label="Your account"
            className="customer-account-section"
          >
            <SectionHeading
              eyebrow="YOUR ACCOUNT"
              title="Account details"
            />
            <Link className="customer-account-card" href="/user/profile">
              <span aria-hidden="true" className="customer-account-avatar">
                {getInitials(name)}
              </span>
              <div className="customer-account-copy">
                <strong>{user?.fullName}</strong>
                <span>{user?.email}</span>
              </div>
              <span className="customer-account-status">View profile</span>
            </Link>
          </section>

          <footer className="customer-dashboard-footer">
            <span>© {new Date().getFullYear()} ServiceHub</span>
            <span>Trusted help for your home</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
