"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, CirclePlus, Pencil, Search, SlidersHorizontal, Star, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { sectionDetails } from "./admin-data";
import { apiRequest, getAdminRecords, getAdminReport, type AdminRecord, type AdminReport } from "@/lib/api";
import { formatMoney } from "@/lib/money";

type Props = { section: string };

function statusClass(status = "") {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function RecordRow({ item, section, onStatusChange, onDelete, onEdit }: {
  item: AdminRecord;
  section: string;
  onStatusChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: AdminRecord) => void;
}) {
  return (
    <tr>
      <td><span className="admin-record-id">{item.id}</span></td>
      <td><span className="admin-table-primary">{item.name}</span>{item.email && <span className="admin-table-secondary">{item.email}</span>}</td>
      {section !== "customers" && section !== "admins" && <td>{item.service ?? item.detail ?? "—"}</td>}
      {(section === "customers" || section === "admins") && <td>{item.detail}</td>}
      {(section === "bookings" || section === "payments" || section === "reviews" || section === "notifications") && <td>{item.date}</td>}
      {section === "services" && <td className="admin-price">{formatMoney(item.price ?? 0)}</td>}
      {section === "reviews" && <td><span className="admin-rating"><Star size={14} fill="currentColor" />{item.rating}.0</span></td>}
      {section !== "reviews" && section !== "notifications" && <td><span className={`admin-status status-${statusClass(item.status)}`}><i />{item.status}</span></td>}
      {(section === "reviews" || section === "notifications") && <td><span className={`admin-status status-${statusClass(item.status)}`}><i />{item.status}</span></td>}
      {(section === "bookings" || section === "payments") && <td className="admin-price">{formatMoney(item.price ?? 0)}</td>}
      <td className="admin-table-actions">
        {section === "bookings" ? <select aria-label={`Update status for ${item.id}`} className="admin-row-status" onChange={(event) => onStatusChange(item.resourceId ?? item.id, event.target.value)} value={item.status}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select> : null}
        {section === "reviews" && item.status === "Pending" ? <button className="admin-table-action" onClick={() => onStatusChange(item.resourceId ?? item.id, "Published")} title="Publish review" type="button"><Check size={16} /></button> : null}
        {section === "services" && <button className="admin-table-action" onClick={() => onEdit(item)} title="Edit service" type="button"><Pencil size={14} /></button>}
        {section === "services" && <button className="admin-table-action" onClick={() => onStatusChange(item.resourceId ?? item.id, item.status === "Active" ? "Inactive" : "Active")} title="Toggle service status" type="button"><Check size={15} /></button>}
        {section === "customers" && <button className="admin-table-action" onClick={() => onStatusChange(item.resourceId ?? item.id, item.status === "Active" ? "Inactive" : "Active")} title="Toggle customer access" type="button"><Check size={15} /></button>}
        {section === "admins" && <button className="admin-table-action" onClick={() => onStatusChange(item.resourceId ?? item.id, item.status === "Active" ? "Inactive" : "Active")} title="Toggle admin access" type="button"><Check size={15} /></button>}
        {section === "reviews" && item.status !== "Pending" && <button className="admin-table-action" onClick={() => onStatusChange(item.resourceId ?? item.id, item.status === "Published" ? "Hidden" : "Published")} title="Toggle review visibility" type="button"><Check size={15} /></button>}
        {section === "notifications" && item.status !== "Sent" && <select aria-label={`Update status for ${item.name}`} className="admin-row-status" onChange={(event) => onStatusChange(item.resourceId ?? item.id, event.target.value)} value={item.status}><option>Draft</option><option value="Sent">Publish in-app</option></select>}
        {section !== "payments" && <button aria-label={`Remove ${item.name}`} className="admin-table-action is-delete" onClick={() => onDelete(item.resourceId ?? item.id)} title="Remove" type="button"><Trash2 size={15} /></button>}
      </td>
    </tr>
  );
}

export default function AdminManagementPage({ section }: Props) {
  const details = sectionDetails[section];
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("75");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newAudience, setNewAudience] = useState("All customers");
  const [editingItem, setEditingItem] = useState<AdminRecord | null>(null);
  const [isLoading, setIsLoading] = useState(section !== "reports");
  const [report, setReport] = useState<AdminReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"month" | "year">("month");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (section === "reports") {
      let active = true;
      getAdminReport(reportPeriod)
        .then((result) => { if (active) setReport(result); })
        .catch((error: unknown) => { if (active) setNotice(error instanceof Error ? error.message : "Could not load reports."); });
      return () => { active = false; };
    }
    let active = true;
    getAdminRecords(section)
      .then((records) => {
        if (active) setItems(records);
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : `Could not load ${section}.`);
      }
      )
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [reportPeriod, section]);

  const statuses = useMemo(() => ["All statuses", ...new Set(items.map((item) => item.status).filter((value): value is string => Boolean(value)))], [items]);
  const filteredItems = items.filter((item) => `${item.id} ${item.name} ${item.email ?? ""} ${item.service ?? ""} ${item.detail ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All statuses" || item.status === filter));

  async function reloadRecords() {
    setItems(await getAdminRecords(section));
  }
  async function updateStatus(id: string, status: string) {
    const endpoints: Record<string, string> = {
      bookings: `/api/admin/bookings/${encodeURIComponent(id)}/status`,
      services: `/api/admin/services/${encodeURIComponent(id)}`,
      customers: `/api/admin/customers/${encodeURIComponent(id)}/status`,
      admins: `/api/admin/admins/${encodeURIComponent(id)}/status`,
      reviews: `/api/admin/reviews/${encodeURIComponent(id)}/status`,
      notifications: `/api/admin/notifications/${encodeURIComponent(id)}/status`,
    };
    try {
      await apiRequest(endpoints[section], { method: "PATCH", body: JSON.stringify({ status }) });
      await reloadRecords();
      setNotice(`${details.singular} status updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not update ${details.singular.toLowerCase()}.`);
    }
  }
  async function deleteItem(id: string) {
    const message = section === "customers"
      ? "Deactivate this customer account?"
      : section === "bookings"
        ? "Cancel this booking?"
        : `Permanently remove this ${details.singular.toLowerCase()}?`;
    if (!window.confirm(message)) return;
    try {
      if (section === "customers") {
        await apiRequest(`/api/admin/customers/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status: "Inactive" }) });
      } else if (section === "bookings") {
        await apiRequest(`/api/admin/bookings/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status: "Cancelled" }) });
      } else {
        await apiRequest(`/api/admin/${section}/${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      await reloadRecords();
      setNotice(section === "customers" ? "Customer access deactivated." : `${details.singular} removed.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not remove ${details.singular.toLowerCase()}.`);
    }
  }
  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const parsedPrice = Number(newPrice);
    if (section === "services" && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setNotice("Enter a valid service price.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (section === "services") {
        const payload = {
          name,
          category: newCategory.trim(),
          description: newDescription.trim(),
          price: parsedPrice,
        };
        if (editingItem) {
          await apiRequest(`/api/admin/services/${encodeURIComponent(editingItem.resourceId ?? editingItem.id)}`, { method: "PATCH", body: JSON.stringify(payload) });
        } else {
          await apiRequest("/api/admin/services", { method: "POST", body: JSON.stringify(payload) });
        }
      } else if (section === "notifications") {
        await apiRequest("/api/admin/notifications", { method: "POST", body: JSON.stringify({ title: name, message: newMessage.trim(), audience: newAudience, status: "Draft" }) });
      } else if (section === "admins") {
        await apiRequest("/api/admin/admins", { method: "POST", body: JSON.stringify({ fullName: name, email: newEmail.trim(), password: newPassword }) });
      }
      await reloadRecords();
      setNotice(editingItem ? `${details.singular} updated.` : `${details.singular} added.`);
      setEditingItem(null);
      setShowForm(false);
      setNewName("");
      setNewPrice("75");
      setNewCategory("");
      setNewDescription("");
      setNewEmail("");
      setNewPassword("");
      setNewMessage("");
      setNewAudience("All customers");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not save ${details.singular.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(item: AdminRecord) {
    setEditingItem(item);
    setNewName(item.name);
    setNewPrice(String(item.price ?? 0));
    setNewCategory(item.category ?? "");
    setNewDescription(item.description ?? "");
    setShowForm(true);
  }

  if (section === "reports") {
    const totalBookings = report?.bookings.reduce((sum, item) => sum + item.bookings, 0) ?? 0;
    const totalRevenue = report?.revenue.reduce((sum, item) => sum + item.revenue, 0) ?? 0;
    return <section className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">INSIGHTS</span><h1>{details.title}</h1><p>{details.description}</p></div><button className="admin-button admin-button-outline" onClick={() => window.print()} type="button"><ArrowDownToLine size={16} /> Export report</button></div><div className="admin-report-cards"><article className="admin-card admin-report-card"><span>Bookings ({reportPeriod === "month" ? "12 months" : "5 years"})</span><strong>{totalBookings.toLocaleString()}</strong></article><article className="admin-card admin-report-card"><span>Paid revenue</span><strong>{formatMoney(totalRevenue)}</strong></article><article className="admin-card admin-report-card"><span>Top service</span><strong>{report?.topServices[0]?._id ?? "—"}</strong></article></div><div className="admin-card admin-report-placeholder"><div className="admin-report-icon"><ArrowRight size={22} /></div><h2>Booking performance</h2><p>Data is calculated from bookings and successfully recorded payments in your ServiceHub database.</p><div className="admin-inline-controls"><select aria-label="Report period" onChange={(event) => setReportPeriod(event.target.value as "month" | "year")} value={reportPeriod}><option value="month">Monthly · last 12 months</option><option value="year">Yearly · last 5 years</option></select></div>{report && <div className="admin-report-series">{report.bookings.map((item) => <div key={item._id}><span>{item._id}</span><strong>{item.bookings} bookings</strong><small>{formatMoney(report.revenue.find((revenue) => revenue._id === item._id)?.revenue ?? 0)}</small></div>)}</div>}</div>{notice && <p className="admin-notice" role="status">{notice}</p>}</section>;
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading"><div><span className="admin-eyebrow">MANAGEMENT</span><h1>{details.title}</h1><p>{details.description}</p></div>{["services", "notifications", "admins"].includes(section) && <button className="admin-button" onClick={() => setShowForm(!showForm)} type="button"><CirclePlus size={17} />{section === "notifications" ? "Create notification" : `Add ${details.singular.toLowerCase()}`}</button>}</div>
      {showForm && <form className="admin-add-form admin-card" onSubmit={addItem}>
        <label htmlFor="admin-new-record">{section === "notifications" ? "Notification title" : `${details.singular} name`}</label>
        <input autoFocus id="admin-new-record" onChange={(event) => setNewName(event.target.value)} placeholder={`Enter ${details.singular.toLowerCase()} name`} required value={newName} />
        {section === "services" && <><label htmlFor="admin-new-category">Category</label><input id="admin-new-category" onChange={(event) => setNewCategory(event.target.value)} required value={newCategory} /><label htmlFor="admin-new-description">Description</label><input id="admin-new-description" onChange={(event) => setNewDescription(event.target.value)} required value={newDescription} /><label htmlFor="admin-new-price">Starting price (BDT)</label><input id="admin-new-price" min="0" onChange={(event) => setNewPrice(event.target.value)} required step="0.01" type="number" value={newPrice} /></>}
        {section === "admins" && !editingItem && <><label htmlFor="admin-new-email">Email address</label><input autoComplete="email" id="admin-new-email" onChange={(event) => setNewEmail(event.target.value)} required type="email" value={newEmail} /><label htmlFor="admin-new-password">Temporary password</label><input autoComplete="new-password" id="admin-new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} /></>}
        {section === "notifications" && <><label htmlFor="admin-new-message">Message</label><textarea id="admin-new-message" onChange={(event) => setNewMessage(event.target.value)} required value={newMessage} /><label htmlFor="admin-new-audience">Audience</label><select id="admin-new-audience" onChange={(event) => setNewAudience(event.target.value)} value={newAudience}><option>All customers</option><option>Active customers</option></select><p className="admin-form-help">Notifications are saved as drafts. Publishing delivers them in the customer account; email/SMS delivery needs a provider.</p></>}
        <button className="admin-button" disabled={isSubmitting} type="submit">{isSubmitting ? "Saving..." : editingItem ? "Save changes" : section === "notifications" ? "Save draft" : `Save ${details.singular.toLowerCase()}`}</button><button className="admin-button admin-button-outline" onClick={() => { setShowForm(false); setEditingItem(null); setNewName(""); setNewPrice("75"); setNewCategory(""); setNewDescription(""); }} type="button">Cancel</button>
      </form>}
      <div className="admin-card admin-table-card">
        <div className="admin-table-toolbar"><div><h2>{details.title} list</h2><span>{items.length} {details.title.toLowerCase()} total</span></div><div className="admin-table-tools"><label className="admin-table-search"><Search size={16} /><input aria-label={`Search ${details.title.toLowerCase()}`} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." value={query} /></label><label className="admin-filter"><SlidersHorizontal size={15} /><select aria-label="Filter by status" onChange={(event) => setFilter(event.target.value)} value={filter}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={13} /></label></div></div>
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>ID</th><th>{section === "customers" || section === "admins" ? "Name" : section === "notifications" ? "Title" : "Customer"}</th>{section !== "customers" && section !== "admins" && <th>{section === "notifications" ? "Details" : "Service"}</th>}{(section === "customers" || section === "admins") && <th>Details</th>}{["bookings", "payments", "reviews", "notifications"].includes(section) && <th>Date</th>}{section === "services" && <th>Price</th>}{section === "reviews" && <th>Rating</th>}{section !== "reviews" && section !== "notifications" && <th>Status</th>}{(section === "reviews" || section === "notifications") && <th>Status</th>}{["bookings", "payments"].includes(section) && <th>Amount</th>}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredItems.map((item) => <RecordRow item={item} key={item.resourceId ?? item.id} onDelete={deleteItem} onEdit={startEditing} onStatusChange={updateStatus} section={section} />)}</tbody></table></div>
        {isLoading && <div className="admin-table-empty">Loading {details.title.toLowerCase()}…</div>}
        {!isLoading && notice && items.length === 0 && <div className="admin-table-empty">{notice}</div>}
        {!isLoading && filteredItems.length === 0 && items.length > 0 && <div className="admin-table-empty">No matching records. Try changing your search or filters.</div>}
        {!isLoading && items.length === 0 && !notice && <div className="admin-table-empty">{section === "payments" ? "No payment records yet. Customer payment choices will appear here." : `No ${details.title.toLowerCase()} found.`}</div>}
        <div className="admin-table-footer"><span>Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> records</span><div><button disabled type="button">Previous</button><button className="is-current" type="button">1</button><button disabled type="button">Next</button></div></div>
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
    </section>
  );
}
