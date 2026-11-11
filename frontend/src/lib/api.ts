const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiObject = Record<string, unknown>;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : "The request could not be completed.";
    throw new Error(message);
  }
  return result as T;
}

export type AdminRecord = {
  id: string;
  resourceId?: string;
  name: string;
  email?: string;
  service?: string;
  category?: string;
  description?: string;
  date?: string;
  price?: number;
  status?: string;
  detail?: string;
  rating?: number;
};

function isObject(value: unknown): value is ApiObject {
  return typeof value === "object" && value !== null;
}

function displayDate(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function recordId(record: ApiObject): string {
  const id = record._id ?? record.id;
  return typeof id === "string" ? id : "";
}

function stringValue(record: ApiObject, key: string, fallback = ""): string {
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

function numberValue(record: ApiObject, key: string): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapRecord(section: string, record: ApiObject): AdminRecord {
  const status = stringValue(record, "status", "Active");
  if (section === "customers" || section === "admins") {
    return {
      id: recordId(record),
      resourceId: recordId(record),
      name: stringValue(record, "fullName", "Unknown"),
      email: stringValue(record, "email"),
      detail: section === "admins" ? "Administrator" : displayDate(record.createdAt),
      status,
    };
  }
  if (section === "services") {
    return {
      id: recordId(record),
      resourceId: recordId(record),
      name: stringValue(record, "name", "Service"),
      service: stringValue(record, "category"),
      category: stringValue(record, "category"),
      description: stringValue(record, "description"),
      detail: stringValue(record, "description"),
      price: numberValue(record, "price"),
      status,
    };
  }
  if (section === "bookings") {
    return {
      id: stringValue(record, "bookingId", recordId(record)),
      resourceId: recordId(record),
      name: stringValue(record, "customerName", "Customer"),
      service: stringValue(record, "serviceName"),
      date: displayDate(record.date),
      price: numberValue(record, "price"),
      status,
      detail: stringValue(record, "address"),
    };
  }
  if (section === "payments") {
    return {
      id: stringValue(record, "transactionId", recordId(record)),
      resourceId: recordId(record),
      name: stringValue(record, "customerName", "Customer"),
      service: stringValue(record, "serviceName"),
      date: displayDate(record.date),
      price: numberValue(record, "amount"),
      status,
    };
  }
  if (section === "reviews") {
    return {
      id: recordId(record),
      resourceId: recordId(record),
      name: stringValue(record, "customerName", "Customer"),
      service: stringValue(record, "serviceName"),
      date: displayDate(record.createdAt),
      rating: numberValue(record, "rating"),
      detail: stringValue(record, "comment"),
      status,
    };
  }
  return {
    id: recordId(record),
    resourceId: recordId(record),
    name: stringValue(record, "title", "Notification"),
    service: stringValue(record, "message"),
    date: displayDate(record.createdAt),
    status,
    detail: stringValue(record, "message"),
  };
}

const sectionEndpoints: Record<string, { endpoint: string; key: string }> = {
  customers: { endpoint: "/api/admin/customers", key: "customers" },
  services: { endpoint: "/api/admin/services", key: "services" },
  bookings: { endpoint: "/api/admin/bookings", key: "bookings" },
  payments: { endpoint: "/api/admin/payments", key: "payments" },
  reviews: { endpoint: "/api/admin/reviews", key: "reviews" },
  notifications: { endpoint: "/api/admin/notifications", key: "notifications" },
  admins: { endpoint: "/api/admin/admins", key: "admins" },
};

export async function getAdminRecords(section: string): Promise<AdminRecord[]> {
  const config = sectionEndpoints[section];
  if (!config) throw new Error("This admin section is not supported.");
  const response = await apiRequest<ApiObject>(config.endpoint);
  const records = response[config.key];
  if (!Array.isArray(records)) throw new Error(`The server returned invalid ${section} data.`);
  return records.filter(isObject).map((record) => mapRecord(section, record));
}

export type AdminOverview = {
  customers: number;
  services: number;
  bookings: number;
  pendingBookings: number;
  completedBookings: number;
  revenue: number;
  averageRating: number;
  bookingStatuses: Record<string, number>;
  popularServices: Array<{ name: string; count: number }>;
  recentBookings: Array<ApiObject>;
};

export function getAdminOverview() {
  return apiRequest<AdminOverview>("/api/admin/overview");
}

export type AdminReport = {
  period: "month" | "year";
  bookings: Array<{ _id: string; bookings: number }>;
  revenue: Array<{ _id: string; revenue: number }>;
  topServices: Array<{ _id: string; bookings: number }>;
};

export function getAdminReport(period: "month" | "year") {
  return apiRequest<AdminReport>(`/api/admin/reports?period=${period}`);
}

export function recordFromApi(section: string, value: unknown): AdminRecord {
  if (!isObject(value)) throw new Error("The server returned invalid record data.");
  return mapRecord(section, value);
}

export function formatApiDate(value: unknown) {
  return displayDate(value);
}

export function getApiString(record: ApiObject, key: string, fallback = "") {
  return stringValue(record, key, fallback);
}

export function getApiNumber(record: ApiObject, key: string) {
  return numberValue(record, key);
}

export function getApiId(record: ApiObject) {
  return recordId(record);
}

export function getService(serviceId: string) {
  return apiRequest<{ service: ServiceRecord }>(
    `/api/services/${encodeURIComponent(serviceId)}`,
  );
}

export function getServices() {
  return apiRequest<{ services: ServiceRecord[] }>("/api/services");
}

export type ServiceRecord = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  status: "Active" | "Inactive";
};

export type BookingRecord = {
  _id: string;
  bookingId: string;
  serviceName: string;
  date: string;
  address: string;
  notes: string;
  price: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Refunded";
};

export function getMyBookings() {
  return apiRequest<{ bookings: BookingRecord[] }>("/api/user/bookings");
}

export function getMyBooking(id: string) {
  return apiRequest<{ booking: BookingRecord }>(
    `/api/user/bookings/${encodeURIComponent(id)}`,
  );
}

export function createBooking(input: {
  serviceId: string;
  date: string;
  address: string;
  notes: string;
}) {
  return apiRequest<{ booking: BookingRecord }>("/api/user/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelMyBooking(id: string) {
  return apiRequest<{ booking: BookingRecord }>(
    `/api/user/bookings/${encodeURIComponent(id)}/cancel`,
    { method: "PATCH" },
  );
}

export function createReview(
  bookingId: string,
  input: { rating: number; comment: string },
) {
  return apiRequest<{ review: unknown }>(
    `/api/user/bookings/${encodeURIComponent(bookingId)}/reviews`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function updateMyProfile(fullName: string) {
  return apiRequest<{
    user: { id: string; fullName: string; email: string; role: "user" | "admin" };
  }>("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
}
