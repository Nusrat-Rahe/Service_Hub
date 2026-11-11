"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays } from "lucide-react";
import { apiRequest } from "@/lib/api";
import "../bookings/booking-pages.css";

type CustomerNotification = {
  _id: string;
  title: string;
  message: string;
  sentAt?: string | null;
  createdAt: string;
};

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ notifications: CustomerNotification[] }>("/api/user/notifications")
      .then(({ notifications: records }) => { if (active) setNotifications(records); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load notifications."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="customer-bookings-page">
      <header className="customer-bookings-heading"><div><span className="eyebrow">YOUR SERVICEHUB</span><h1>Notifications</h1><p>Updates and announcements from ServiceHub.</p></div></header>
      {error && <p className="customer-bookings-error" role="alert">{error}</p>}
      {isLoading ? <div className="customer-bookings-empty">Loading notifications…</div> : notifications.length ? <div className="customer-notifications-list">{notifications.map((notification) => <article className="customer-notification-card" key={notification._id}><span className="customer-booking-icon"><Bell size={19} /></span><div><h2>{notification.title}</h2><p>{notification.message}</p><small><CalendarDays size={13} />{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(notification.sentAt ?? notification.createdAt))}</small></div></article>)}</div> : !error && <div className="customer-bookings-empty"><Bell size={28} /><h2>You&apos;re all caught up</h2><p>New ServiceHub announcements will show up here.</p></div>}
    </main>
  );
}
