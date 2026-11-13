"use client";

import { useEffect, useState } from "react";

const DHAKA_TIME_ZONE = "Asia/Dhaka";
const DHAKA_OFFSET = "+06:00";

export function getDhakaDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatDhakaDate(dateKey: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateKey}T12:00:00${DHAKA_OFFSET}`));
}

export function parseDhakaDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    Number(hour) > 23 ||
    Number(minute) > 59
  ) {
    return null;
  }

  const parsed = new Date(`${value}:00${DHAKA_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function useDhakaToday(): string {
  const [today, setToday] = useState(() => getDhakaDateKey());

  useEffect(() => {
    const updateToday = () => setToday(getDhakaDateKey());
    const interval = window.setInterval(updateToday, 30_000);
    updateToday();
    return () => window.clearInterval(interval);
  }, []);

  return today;
}
