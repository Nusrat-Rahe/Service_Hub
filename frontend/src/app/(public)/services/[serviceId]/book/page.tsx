"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import AuthModal, { type AuthModalType } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AuthUser } from "@/lib/auth";
import {
  createBooking,
  getCategory,
  getService,
  getServiceSlots,
  type ServiceRecord,
  type CategoryRecord,
  type ServiceSlot,
} from "@/lib/api";
import { logoutUser } from "@/lib/auth";
import { formatDhakaDate, getDhakaDateKey } from "@/lib/dhaka-date";
import { formatMoney } from "@/lib/money";
import "./booking-wizard.css";

const paymentMethods = [
  { id: "cod", title: "Cash on Delivery", note: "Payment status stays pending until received.", Icon: Banknote },
  { id: "bkash", title: "bKash", note: "Academic project simulation; no real transaction.", Icon: Banknote },
  { id: "card", title: "Card Payment", note: "Academic project simulation; no real transaction.", Icon: CreditCard },
] as const;

function monthDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) =>
      `${month}-${String(index + 1).padStart(2, "0")}`,
    ),
  ];
}

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
}

function nextMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1 + delta, 1)).toISOString().slice(0, 7);
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(new Date(Date.UTC(2020, 0, 1, hours - 6, minutes)));
}

export default function BookingRequestPage() {
  return (
    <Suspense fallback={<main className="service-detail-page"><div className="container">Loading booking form…</div></main>}>
      <BookingRequestContent />
    </Suspense>
  );
}

function BookingRequestContent() {
  const params = useParams<{ serviceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser, isLoadingUser } = useAuth();
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [month, setMonth] = useState(() => getDhakaDateKey().slice(0, 7));
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<(typeof paymentMethods)[number]["id"]>("cod");
  const [error, setError] = useState("");
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);
  const today = getDhakaDateKey();
  const selectedSlot = slots.find((slot) => slot._id === slotId) ?? null;
  const availableDates = useMemo(
    () => new Set(slots.filter((slot) => slot.available).map((slot) => slot.date)),
    [slots],
  );
  const selectedType = useMemo(() => {
    const subcategoryId = searchParams.get("subcategoryId");
    const slug = searchParams.get("type");
    return category?.subcategories.find((type) =>
      subcategoryId ? type._id === subcategoryId : type.slug === slug,
    );
  }, [category, searchParams]);

  const selectedServiceName = selectedType?.name ?? service?.name ?? "Service";
  const categoryName = category?.name ?? "Home service";
  const subcategoryName = selectedType?.name ?? "Select service type";

  useEffect(() => {
    let active = true;
    getCategory(searchParams.get("categoryId") ?? params.serviceId)
      .then(({ category: record }) => {
        if (active && record.service._id === params.serviceId) setCategory(record);
        else if (active) setError("This service type is not available for the selected service.");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load the service category.");
      });
    return () => { active = false; };
  }, [params.serviceId, searchParams]);

  useEffect(() => {
    let active = true;
    getService(params.serviceId)
      .then(({ service: record }) => {
        if (!active) return;
        setService(record);
        setFullName(user?.fullName ?? "");
        setEmail(user?.email ?? "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this service.");
      })
      .finally(() => {
        if (active) setIsLoadingService(false);
      });
    return () => { active = false; };
  }, [params.serviceId, user]);

  useEffect(() => {
    if (!service) return;
    let active = true;
    getServiceSlots(service._id, month)
      .then(({ slots: records }) => {
        if (active) {
          setSlots(records);
          setDate((currentDate) =>
            records.some((slot) => slot.date === currentDate && slot.available) ? currentDate : "",
          );
          setSlotId((currentSlotId) =>
            records.some((slot) => slot._id === currentSlotId && slot.available) ? currentSlotId : "",
          );
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load available time slots.");
      })
      .finally(() => {
        if (active) setIsLoadingSlots(false);
      });
    return () => { active = false; };
  }, [month, service]);

  const slotsForDate = slots.filter((slot) => slot.date === date);

  function chooseDate(value: string) {
    setDate(value);
    setSlotId("");
    setError("");
  }

  function changeMonth(delta: number) {
    setIsLoadingSlots(true);
    setMonth((currentMonth) => nextMonth(currentMonth, delta));
    setDate("");
    setSlotId("");
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setAuthModal("login");
      return;
    }
    setError("");
    setStep(3);
  }

  async function confirmBooking() {
    if (!user || !service || !category || !selectedType || !selectedSlot) return;
    setError("");
    setIsSubmitting(true);
    try {
      const appointment = new Date(`${selectedSlot.date}T${selectedSlot.startTime}:00+06:00`);
      const { payment } = await createBooking({
        serviceId: service._id,
        categoryId: category._id,
        subcategoryId: selectedType._id,
        slotId: selectedSlot._id,
        date: appointment.toISOString(),
        fullName,
        email,
        phone,
        address,
        notes,
        paymentMethod: method,
      });
      router.push(`/user/payments/${payment._id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not confirm your booking.");
      setStep(1);
      setMonth(selectedSlot.date.slice(0, 7));
      setDate(selectedSlot.date);
      setSlotId(selectedSlot._id);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAuthSuccess(authenticatedUser: AuthUser) {
    setAuthModal(null);
    if (authenticatedUser.role !== "user") {
      try {
        await logoutUser();
      } catch (logoutError) {
        console.error("Could not sign out the administrator from the customer booking form.", logoutError);
      }
      setError("Please sign in with a customer account to request a service.");
      return;
    }
    setUser(authenticatedUser);
    setFullName(authenticatedUser.fullName);
    setEmail(authenticatedUser.email);
  }

  const canContinueSchedule = Boolean(selectedSlot?.available && address.trim() && category && selectedType);

  return (
    <>
      <main className="booking-wizard-page">
        <div className="booking-wizard-container">
          <Link className="booking-back-link" href={category && selectedType ? `/services/${category.slug}/${selectedType.slug}` : "/services"}>
            <ArrowLeft size={16} /> Back to Services
          </Link>
          <header className="booking-page-heading">
            <span className="eyebrow">BOOK A SERVICE</span>
            <h1>Book Your Appointment</h1>
            <p>Select your preferred date and time to book {selectedServiceName} service.</p>
            <nav className="booking-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span>›</span><span>{categoryName}</span><span>›</span><span>{subcategoryName}</span><span>›</span><strong>{selectedServiceName}</strong>
            </nav>
          </header>
          {category && !selectedType && <p className="booking-wizard-error" role="alert">Select a service type before booking. <Link href={`/services/${category.slug}`}>Browse {category.name} services</Link>.</p>}

          <div className="booking-wizard-shell">
            <ol className={`booking-progress booking-progress-step-${step}`}>
              {["Choose Schedule", "Confirm Details", "Payment & Booking"].map((title, index) => {
                const number = index + 1;
                const isComplete = step > number;
                return (
                  <li className={step === number ? "is-current" : isComplete ? "is-complete" : ""} key={title}>
                    <button disabled={number > step} onClick={() => setStep(number)} type="button">
                      <span>{isComplete ? <Check size={17} /> : number}</span>
                      <strong>{title}</strong>
                    </button>
                  </li>
                );
              })}
            </ol>

            {error && <p className="booking-wizard-error" role="alert">{error}</p>}

            <div className="booking-wizard-content">
              <section className="booking-stage-card">
                {step === 1 && (
                  <>
                    <div className="booking-stage-heading">
                      <span><CalendarDays size={20} /></span>
                      <div><h2>Choose Schedule</h2><p>Select an available date and time slot.</p></div>
                    </div>
                    <div className="booking-schedule-grid">
                      <section className="booking-calendar-panel">
                        <div className="booking-panel-heading"><CalendarDays size={18} /><h3>Select Date</h3></div>
                        <div className="booking-calendar-month">
                          <button aria-label="Previous month" disabled={month <= today.slice(0, 7)} onClick={() => changeMonth(-1)} type="button"><ChevronLeft size={18} /></button>
                          <strong>{monthLabel(month)}</strong>
                          <button aria-label="Next month" onClick={() => changeMonth(1)} type="button"><ChevronRight size={18} /></button>
                        </div>
                        <div className="booking-calendar-grid" role="grid" aria-label={monthLabel(month)}>
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span className="booking-calendar-weekday" key={day}>{day}</span>)}
                          {monthDays(month).map((day, index) => {
                            const enabled = Boolean(day && day >= today && availableDates.has(day));
                            return day ? (
                              <button
                                aria-label={`${day}${enabled ? ", available" : ", unavailable"}`}
                                aria-pressed={date === day}
                                className={`booking-calendar-day${date === day ? " is-selected" : ""}${enabled ? " is-available" : ""}`}
                                disabled={!enabled || isLoadingSlots}
                                key={day}
                                onClick={() => chooseDate(day)}
                                type="button"
                              >
                                {Number(day.slice(-2))}
                              </button>
                            ) : <span aria-hidden="true" className="booking-calendar-empty" key={`empty-${index}`} />
                          })}
                        </div>
                        <div className="booking-calendar-legend"><span><i className="is-available" />Available</span><span><i className="is-booked" />Booked</span><span><i />Unavailable</span></div>
                      </section>

                      <section className="booking-slots-panel">
                        <div className="booking-panel-heading"><Clock3 size={18} /><h3>Select Time Slot</h3></div>
                        <p className="booking-selected-day">{date ? formatDhakaDate(date) : "Choose a date to view available times"}</p>
                        {isLoadingSlots ? <p className="booking-slots-empty">Loading availability…</p> : date ? slotsForDate.length ? (
                          <div className="booking-time-slots">
                            {slotsForDate.map((slot) => (
                              <button
                                aria-pressed={slotId === slot._id}
                                className={`booking-time-slot${slotId === slot._id ? " is-selected" : ""}`}
                                disabled={!slot.available}
                                key={slot._id}
                                onClick={() => setSlotId(slot._id)}
                                type="button"
                              >
                                <strong>{formatTime(slot.startTime)}</strong>
                                <span>{slot.available ? "Available" : "Booked"}</span>
                                {!slot.available && <span className="booking-slot-lock">×</span>}
                                {slotId === slot._id && <CheckCircle2 className="booking-slot-check" size={17} />}
                              </button>
                            ))}
                          </div>
                        ) : <p className="booking-slots-empty">No slots available for this date. Please choose another date.</p> : <p className="booking-slots-empty">Select an available date to see its time slots.</p>}
                        <p className="booking-slot-note"><Clock3 size={14} /> Each slot is 1 hour. All times are in Bangladesh Standard Time.</p>
                      </section>
                    </div>

                    <div className="booking-schedule-fields">
                      <label><span><MapPin size={16} />Service Address</span><input autoComplete="street-address" maxLength={300} onChange={(event) => setAddress(event.target.value)} placeholder="Street address, city" required value={address} /><small>Your service location</small></label>
                      <label><span><FileText size={16} />Special Instructions <small>(Optional)</small></span><textarea maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. Please bring necessary cleaning equipment…" rows={3} value={notes} /></label>
                    </div>
                    {!isLoadingUser && !user && <div className="booking-login-prompt"><span>Sign in is required to confirm a booking.</span><button className="booking-inline-link" onClick={() => setAuthModal("login")} type="button">Sign in</button></div>}
                    <div className="booking-stage-actions">
                      <span className="booking-secure-note"><ShieldCheck size={17} /> Secure booking</span>
                      <button className="button" disabled={!canContinueSchedule || !user} onClick={() => { setError(""); setStep(2); }} type="button">Continue to Details <ArrowRight size={17} /></button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <form onSubmit={submitDetails}>
                    <div className="booking-stage-heading">
                      <span><FileText size={20} /></span>
                      <div><h2>Confirm Details</h2><p>Tell us how to reach you for this booking.</p></div>
                    </div>
                    <div className="booking-contact-fields">
                      <label>Full Name<input autoComplete="name" maxLength={100} onChange={(event) => setFullName(event.target.value)} required value={fullName} /></label>
                      <label>Phone Number<input autoComplete="tel" maxLength={30} onChange={(event) => setPhone(event.target.value)} required type="tel" value={phone} /></label>
                      <label>Email Address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
                      <label>Service Address<input autoComplete="street-address" maxLength={300} onChange={(event) => setAddress(event.target.value)} required value={address} /></label>
                      <label className="booking-contact-notes">Additional Instructions <span>(Optional)</span><textarea maxLength={1000} onChange={(event) => setNotes(event.target.value)} rows={4} value={notes} /></label>
                    </div>
                    <div className="booking-stage-actions">
                      <button className="button button-outline" onClick={() => setStep(1)} type="button"><ArrowLeft size={17} /> Back to Schedule</button>
                      <button className="button" type="submit">Continue to Payment <ArrowRight size={17} /></button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <>
                    <div className="booking-stage-heading">
                      <span><CreditCard size={20} /></span>
                      <div><h2>Payment Method</h2><p>Choose your preferred payment method to complete the booking.</p></div>
                    </div>
                    <div className="booking-payment-options">
                      {paymentMethods.map(({ id, title, note, Icon }) => (
                        <button aria-pressed={method === id} className={`booking-payment-option${method === id ? " is-selected" : ""}`} key={id} onClick={() => { setMethod(id); setError(""); }} type="button">
                          <span className="booking-payment-radio">{method === id ? <Check size={15} /> : null}</span>
                          <Icon aria-hidden="true" size={36} strokeWidth={1.8} />
                          <strong>{title}</strong>
                          <span>{note}</span>
                        </button>
                      ))}
                    </div>
                    <div className="booking-payment-security"><ShieldCheck size={25} /><span><strong>No payment details required</strong><small>bKash and Card are academic project simulations. No real transaction takes place; do not enter a PIN, OTP, or card information.</small></span></div>
                    <div className="booking-stage-actions">
                      <button className="button button-outline" onClick={() => setStep(2)} type="button"><ArrowLeft size={17} /> Back</button>
                      <button className="button" disabled={isSubmitting || !user} onClick={confirmBooking} type="button">{isSubmitting ? "Confirming…" : <><CalendarDays size={17} /> Confirm Booking <ArrowRight size={17} /></>}</button>
                    </div>
                  </>
                )}
              </section>

              <aside className="booking-summary-card">
                <h2><CalendarDays size={18} /> Booking Summary</h2>
                <div className="booking-summary-service">
                  <div className="booking-summary-image">
                    {service?.image ? <Image alt={selectedServiceName} fill sizes="160px" src={service.image} unoptimized /> : null}
                  </div>
                  <div><strong>{selectedServiceName}</strong><p>{selectedType?.description ?? service?.description ?? "Professional home service."}</p><b>{service ? formatMoney(service.price) : "—"}</b></div>
                </div>
                <dl className="booking-summary-list">
                  <div><dt><CalendarDays size={15} />Date</dt><dd>{date ? formatDhakaDate(date) : "Select date"}</dd></div>
                  <div><dt><Clock3 size={15} />Time</dt><dd>{selectedSlot ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` : "Select time"}</dd></div>
                  <div><dt><Clock3 size={15} />Duration</dt><dd>{selectedSlot ? "1 hour" : "—"}</dd></div>
                  {address && <div><dt><MapPin size={15} />Service Address</dt><dd>{address}</dd></div>}
                  {notes && <div><dt><FileText size={15} />Special Instructions</dt><dd>{notes}</dd></div>}
                </dl>
                <div className="booking-summary-total"><strong>Total Amount</strong><b>{service ? formatMoney(service.price) : "—"}</b></div>
              </aside>
            </div>
            <div className="booking-trust-row"><span><ShieldCheck size={16} />No payment details needed</span><span><CheckCircle2 size={16} />24/7 Customer Support</span><span><CheckCircle2 size={16} />Trusted by ServiceHub Customers</span></div>
            {isLoadingService && <p className="booking-loading" role="status">Loading service details…</p>}
          </div>
        </div>
      </main>
      <AuthModal onClose={() => setAuthModal(null)} onSwitch={setAuthModal} onSuccess={handleAuthSuccess} type={authModal} />
    </>
  );
}
