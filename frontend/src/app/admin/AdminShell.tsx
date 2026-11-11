"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, CalendarDays, ChartNoAxesCombined, ChevronDown, ChevronLeft,
  ChevronRight, CircleDollarSign, House, LayoutDashboard, LogOut, Menu,
  MessageSquareText, Search, Settings2, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/lib/auth";

const primaryLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
];
const secondaryLinks = [
  { label: "Payments", href: "/admin/payments", icon: CircleDollarSign },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquareText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Reports & analytics", href: "/admin/reports", icon: ChartNoAxesCombined },
  { label: "Admin accounts", href: "/admin/accounts", icon: ShieldCheck },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/admin/login");
    } catch (error) {
      console.error("Could not sign out.", error);
    }
  }

  function renderLinks(items: typeof primaryLinks) {
    return items.map(({ label, href, icon: Icon }) => {
      const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));
      return (
        <Link
          aria-current={active ? "page" : undefined}
          className={`admin-nav-link${active ? " is-active" : ""}`}
          href={href}
          key={href}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? label : undefined}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
          <span>{label}</span>
          {label === "Bookings" && <span className="admin-nav-count">8</span>}
        </Link>
      );
    });
  }

  return (
    <div className={`admin-app${collapsed ? " sidebar-collapsed" : ""}`}>
      {mobileOpen && <button aria-label="Close navigation" className="admin-mobile-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`admin-sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <Link aria-label="ServiceHub admin home" className="admin-brand" href="/admin/dashboard">
          <span className="admin-brand-mark"><House aria-hidden="true" size={21} strokeWidth={2.2} /></span>
          <span className="admin-brand-copy"><strong>Service<span>Hub</span></strong><small>ADMIN CONSOLE</small></span>
          <button aria-label="Collapse sidebar" className="admin-collapse" onClick={(event) => { event.preventDefault(); setCollapsed(!collapsed); }} type="button">
            <ChevronLeft size={17} />
          </button>
        </Link>
        <div className="admin-sidebar-scroll">
          <p className="admin-nav-caption">WORKSPACE</p>
          <nav aria-label="Main navigation" className="admin-navigation">{renderLinks(primaryLinks)}</nav>
          <p className="admin-nav-caption admin-nav-caption-spaced">MANAGE</p>
          <nav aria-label="Management navigation" className="admin-navigation">{renderLinks(secondaryLinks)}</nav>
        </div>
        <div className="admin-sidebar-bottom">
          <div className="admin-help-card"><span className="admin-help-icon"><Settings2 size={17} /></span><strong>Need a hand?</strong><small>Visit the help center</small><ChevronRight size={15} /></div>
          <button className="admin-nav-link admin-logout" onClick={handleLogout} type="button">
            <LogOut aria-hidden="true" size={19} /><span>Log out</span>
          </button>
          <div className="admin-sidebar-user">
            <span className="admin-avatar">{user?.fullName?.charAt(0).toUpperCase() ?? "A"}</span>
            <span className="admin-sidebar-user-copy"><strong>{user?.fullName ?? "Admin"}</strong><small>{user?.email ?? "Administrator"}</small></span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button aria-label="Open navigation" className="admin-mobile-menu" onClick={() => setMobileOpen(true)} type="button"><Menu size={21} /></button>
          <div className="admin-topbar-search"><Search aria-hidden="true" size={17} /><input aria-label="Search dashboard" onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." value={search} /><kbd>⌘ K</kbd></div>
          <div className="admin-topbar-actions">
            <span className="admin-topbar-date">Tuesday, November 18</span>
            <Link aria-label="Notifications (3 unread)" className="admin-icon-button admin-notification-button" href="/admin/notifications"><Bell size={19} /><i>3</i></Link>
            <div className="admin-profile-wrap">
              <button aria-expanded={profileOpen} className="admin-profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
                <span className="admin-avatar">{user?.fullName?.charAt(0).toUpperCase() ?? "A"}</span>
                <span className="admin-profile-copy"><strong>{user?.fullName ?? "Admin"}</strong><small>Administrator</small></span><ChevronDown size={15} />
              </button>
              {profileOpen && <div className="admin-profile-menu"><strong>{user?.email ?? "Admin account"}</strong><button onClick={handleLogout} type="button"><LogOut size={15} /> Log out</button></div>}
            </div>
            <button aria-label="Close mobile navigation" className="admin-mobile-close" onClick={() => setMobileOpen(false)} type="button"><X size={20} /></button>
          </div>
        </header>
        <div className="admin-content" data-global-search={search}>{children}</div>
      </main>
    </div>
  );
}

export function AdminSidebarToggle() {
  return <button aria-label="Toggle sidebar" className="admin-icon-button admin-sidebar-toggle" type="button"><Menu size={19} /></button>;
}
