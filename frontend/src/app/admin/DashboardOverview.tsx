"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, CalendarCheck2,
  CheckCircle2, CircleDollarSign, Clock3, Download, Ellipsis, Star,
  UsersRound, Wrench,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import Link from "next/link";
import { apiRequest, formatApiDate, getAdminOverview, getAdminReport, getApiId, getApiNumber, getApiString, type AdminOverview, type AdminReport } from "@/lib/api";
import { formatMoney } from "@/lib/money";

function BookingStatus({ status }: { status: string }) {
  return <span className={`admin-status status-${status.toLowerCase()}`}><i />{status}</span>;
}

export default function DashboardOverview() {
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverview()
      .then((result) => { if (active) setOverview(result); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load dashboard data."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getAdminReport(period)
      .then((result) => { if (active) setReport(result); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load booking trends."); });
    return () => { active = false; };
  }, [period]);

  const chartData = useMemo(() => (report?.bookings ?? []).map((item) => ({
    month: period === "month" ? item._id.slice(5) : item._id,
    bookings: item.bookings,
  })), [period, report]);
  const bookingStates = useMemo(() => {
    const colors: Record<string, string> = { Completed: "#0b8f68", Confirmed: "#5bc49b", Pending: "#f0b858", Cancelled: "#e58a88" };
    const counts = overview?.bookingStatuses ?? {};
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return Object.entries(colors).map(([name, color]) => ({
      name,
      count: counts[name] ?? 0,
      value: total ? Math.round(((counts[name] ?? 0) / total) * 100) : 0,
      color,
    }));
  }, [overview]);
  const maxServiceCount = Math.max(1, ...(overview?.popularServices.map((service) => service.count) ?? []));
  const stats = [
    { label: "Total customers", value: overview?.customers ?? 0, icon: UsersRound, tone: "mint" },
    { label: "Total services", value: overview?.services ?? 0, icon: Wrench, tone: "blue" },
    { label: "Total bookings", value: overview?.bookings ?? 0, icon: CalendarCheck2, tone: "violet" },
    { label: "Pending bookings", value: overview?.pendingBookings ?? 0, icon: Clock3, tone: "amber" },
    { label: "Completed bookings", value: overview?.completedBookings ?? 0, icon: CheckCircle2, tone: "mint" },
    { label: "Total revenue", value: formatMoney(overview?.revenue ?? 0), icon: CircleDollarSign, tone: "blue" },
    { label: "Average rating", value: (overview?.averageRating ?? 0).toFixed(1), icon: Star, tone: "amber" },
  ];

  return (
    <section className="admin-page">
      <div className="admin-page-heading admin-dashboard-heading">
        <div><span className="admin-eyebrow">OVERVIEW</span><h1>Welcome back, Admin <span aria-hidden="true">✦</span></h1><p>Here&apos;s what&apos;s happening with your services today.</p></div>
        <button className="admin-button admin-button-outline" onClick={() => window.print()} type="button"><Download size={16} /> Download report</button>
      </div>
      {error && <p className="admin-notice admin-error" role="alert">{error}</p>}

      <div className="admin-stats-grid">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article className="admin-card admin-stat-card" key={label}>
            <div className="admin-stat-top"><span className={`admin-stat-icon tone-${tone}`}><Icon aria-hidden="true" size={19} strokeWidth={1.8} /></span><button aria-label={`More about ${label}`} className="admin-more-button" type="button"><Ellipsis size={19} /></button></div>
            <span className="admin-stat-label">{label}</span>
            <div className="admin-stat-bottom"><strong>{value}</strong><span className="admin-stat-change trend-neutral">{overview ? "Database" : "Loading"}</span></div>
          </article>
        ))}
      </div>

      <div className="admin-analytics-grid">
        <article className="admin-card admin-chart-card">
          <div className="admin-card-heading"><div><h2>Booking overview</h2><p>Track booking activity over time</p></div><div className="admin-chart-controls"><span className="admin-chart-legend"><i /> Bookings</span><button aria-label="More booking overview options" className="admin-more-button" type="button"><Ellipsis size={19} /></button></div></div>
          <div className="admin-chart-summary"><strong>{overview?.bookings.toLocaleString() ?? "—"}</strong><span className="admin-stat-change trend-neutral"><Activity size={13} /> {period === "month" ? "Monthly" : "Yearly"}</span><small>bookings in selected period</small></div>
          <div className="admin-booking-chart"><ResponsiveContainer height="100%" width="100%"><BarChart data={chartData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }} barCategoryGap="38%"><CartesianGrid stroke="#edf2ef" strokeDasharray="3 5" vertical={false} /><XAxis axisLine={false} tickLine={false} dataKey="month" tick={{ fill: "#82918a", fontSize: 11 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#82918a", fontSize: 11 }} tickCount={5} /><Tooltip cursor={{ fill: "#f2f8f5" }} contentStyle={{ border: "1px solid #e6eee9", borderRadius: 10, boxShadow: "0 8px 24px #0e3c2a15", fontSize: 12 }} /><Bar dataKey="bookings" fill="#087f5b" radius={[5, 5, 0, 0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div>
          <div className="admin-chart-period"><button className={period === "month" ? "is-selected" : ""} onClick={() => setPeriod("month")} type="button">Monthly</button><button className={period === "year" ? "is-selected" : ""} onClick={() => setPeriod("year")} type="button">Yearly</button></div>
        </article>

        <article className="admin-card admin-status-chart-card">
          <div className="admin-card-heading"><div><h2>Booking status</h2><p>Current booking breakdown</p></div><button aria-label="More booking status options" className="admin-more-button" type="button"><Ellipsis size={19} /></button></div>
          <div className="admin-donut-wrap"><ResponsiveContainer height="100%" width="100%"><PieChart><Pie data={bookingStates} dataKey="count" nameKey="name" innerRadius="69%" outerRadius="92%" paddingAngle={4} stroke="none" startAngle={90} endAngle={-270}>{bookingStates.map((status) => <Cell fill={status.color} key={status.name} />)}</Pie><Tooltip contentStyle={{ border: "1px solid #e6eee9", borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="admin-donut-center"><strong>{overview?.bookings.toLocaleString() ?? "—"}</strong><span>Total bookings</span></div></div>
          <div className="admin-status-legend">{bookingStates.map(({ name, value, color }) => <div key={name}><span><i style={{ backgroundColor: color }} />{name}</span><strong>{value}%</strong></div>)}</div>
        </article>

        <article className="admin-card admin-popular-card">
          <div className="admin-card-heading"><div><h2>Popular services</h2><p>Most requested this month</p></div><Link className="admin-text-link" href="/admin/services">View all <ArrowRight size={14} /></Link></div>
          <div className="admin-popular-list">{(overview?.popularServices ?? []).map((service, index) => <div className="admin-popular-item" key={service.name}><span className={`admin-popular-rank rank-${index + 1}`}>0{index + 1}</span><div className="admin-popular-info"><div><strong>{service.name}</strong><span>{service.count} bookings</span></div><div className="admin-progress-track"><i className={`progress-${["mint", "blue", "amber", "violet"][index % 4]}`} style={{ width: `${Math.max(4, (service.count / maxServiceCount) * 100)}%` }} /></div></div></div>)}</div>
          <Link className="admin-popular-footer" href="/admin/reports">Explore service insights <ArrowRight size={15} /></Link>
        </article>
      </div>

      <section className="admin-card admin-table-card admin-recent-card">
        <div className="admin-table-toolbar"><div><h2>Recent bookings</h2><span>A snapshot of your latest service requests</span></div><Link className="admin-view-all" href="/admin/bookings">View all bookings <ArrowRight size={15} /></Link></div>
        <div className="admin-table-scroll"><table className="admin-table admin-recent-table"><thead><tr><th>BOOKING ID</th><th>CUSTOMER</th><th>SERVICE</th><th>BOOKING DATE</th><th>PRICE</th><th>STATUS</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{(overview?.recentBookings ?? []).map((booking) => { const id = getApiId(booking); const bookingCode = getApiString(booking, "bookingId", id); const status = getApiString(booking, "status"); return <tr key={id}><td><span className="admin-record-id">{bookingCode}</span></td><td><span className="admin-table-primary">{getApiString(booking, "customerName", "Customer")}</span></td><td>{getApiString(booking, "serviceName")}</td><td>{formatApiDate(booking.date)}</td><td className="admin-price">{formatMoney(getApiNumber(booking, "price"))}</td><td><BookingStatus status={status} /></td><td><Link aria-label={`View booking ${bookingCode}`} className="admin-row-link" href="/admin/bookings"><ArrowRight size={16} /></Link></td></tr>; })}</tbody></table></div>
        <div className="admin-recent-footer"><span><span className="admin-live-dot" /> Live updates enabled</span><Link href="/admin/bookings">See all bookings <ArrowRight size={14} /></Link></div>
      </section>
    </section>
  );
}
