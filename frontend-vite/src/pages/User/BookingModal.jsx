import React, { useRef, useState } from "react";
import {
  Calendar, X, CheckCircle, Clock, Phone, MapPin,
  Banknote, CreditCard, FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM",  "2:00 PM",  "3:00 PM",
  "4:00 PM",  "5:00 PM",  "6:00 PM",
];

// Busy slots — ideally aayenge backend se
const BUSY_SLOTS = [];

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getNext7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day: DAYS[d.getDay()],
      num: d.getDate(),
      mon: MONTHS[d.getMonth()],
      full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    };
  });
}

const CATEGORY_ICONS = {
  electrician: "⚡", plumber: "🔧", carpenter: "🪚",
  painter: "🎨", cleaner: "🧹", ac: "❄️", default: "🛠️",
};

const BookingModal = ({ isOpen, onClose, provider }) => {
  const dates = getNext7Days();

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [bookingSlot, setBookingSlot] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef(null);

  if (!isOpen) return null;

  const catKey = (provider?.category || "").toLowerCase();
  const catIcon = CATEGORY_ICONS[catKey] ?? CATEGORY_ICONS.default;

  const resetForm = () => {
    setSelectedDate(dates[0]);
    setBookingSlot("");
    setMobileNumber("");
    setAddress("");
    setDescription("");
    setPaymentMethod("COD");
  };

  const handleClose = () => {
    resetForm();
    setDragOffset({ x: 0, y: 0 });
    onClose();
  };

  const handleDragStart = (e) => {
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY,
      originX: dragOffset.x, originY: dragOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleDragMove = (e) => {
    if (!dragStartRef.current) return;
    setDragOffset({
      x: dragStartRef.current.originX + e.clientX - dragStartRef.current.startX,
      y: dragStartRef.current.originY + e.clientY - dragStartRef.current.startY,
    });
  };
  const handleDragEnd = (e) => {
    if (dragStartRef.current?.pointerId === e.pointerId) dragStartRef.current = null;
  };

  const openRazorpayCheckout = async (booking) => {
    const token = localStorage.getItem("token");
    const isLoaded = await loadRazorpayCheckout();

    if (!isLoaded || !window.Razorpay) {
      toast.error("Razorpay checkout could not load. Please try again.");
      return false;
    }

    const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId: booking.id }),
    });
    const orderData = await orderRes.json();

    if (!orderData.success) {
      toast.error(orderData.message || "Failed to start payment");
      return false;
    }

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : {};

    return new Promise((resolve) => {
      const checkout = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "LocalServe",
        description: `${booking.serviceCategory} booking payment`,
        order_id: orderData.order.id,
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: mobileNumber.trim(),
        },
        theme: { color: "#7c3aed" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment successful! Booking request sent.");
              resolve(true);
            } else {
              toast.error(verifyData.message || "Payment verification failed");
              resolve(false);
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("Payment verification failed");
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Booking request saved. You can pay later from My Bookings.");
            resolve(false);
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed");
        resolve(false);
      });

      checkout.open();
    });
  };

  const handleConfirmBooking = async () => {
    const mobile = mobileNumber.trim();
    const manualAddress = address.trim();

    if (!bookingSlot) return toast.error("Please select a time slot");
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error("Enter a valid 10 digit mobile number");
    if (!manualAddress) return toast.error("Please enter your address");

    setLoading(true);
    try {
      const slotIdx = TIME_SLOTS.indexOf(bookingSlot);
      const nextSlot = slotIdx < TIME_SLOTS.length - 1 ? TIME_SLOTS[slotIdx + 1] : "7:00 PM";

      const response = await fetch(`${API_BASE_URL}/api/bookings/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          providerId: provider.id,
          serviceCategory: provider.category,
          bookingDate: selectedDate.full,
          bookingSlot: `${bookingSlot} - ${nextSlot}`,
          customerMobile: mobile,
          customerAddress: manualAddress,
          description: description.trim(),
          paymentMode: paymentMethod,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (paymentMethod === "Online") {
          await openRazorpayCheckout(data.booking);
        } else {
          toast.success("Appointment requested! You will be notified once the provider confirms");
        }
        resetForm();
        onClose();
      } else {
        toast.error(data.message || "Booking request failed");
      }
    } catch {
      toast.error("Server error, try again later!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          animation: "slideUp 0.3s cubic-bezier(.22,1,.36,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (Draggable) ── */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="relative flex cursor-grab touch-none select-none items-center justify-between border-b border-slate-700/50 bg-slate-800/80 px-5 py-4 active:cursor-grabbing"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-20 w-40 rounded-full bg-violet-600/10 blur-2xl" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/20 text-xl ring-1 ring-violet-500/30">
              {catIcon}
            </div>
            <div>
              <p className="text-base font-bold text-white">Book Appointment</p>
              <p className="text-xs text-slate-400">
                with{" "}
                <span className="font-semibold text-violet-300">
                  {provider?.User?.name || "Expert Provider"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-600 bg-slate-700/50 text-slate-400 transition hover:border-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="max-h-[75vh] overflow-y-auto p-5" style={{ scrollbarWidth: "none" }}>
          <div className="flex flex-col gap-5">

            {/* Service Badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-600/10 px-4 py-3">
              <span className="text-2xl">{catIcon}</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">Service</p>
                <p className="text-sm font-bold capitalize text-white">{provider?.category || "Service"}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-slate-400">Available Slots</p>
                <p className="text-xs font-semibold text-emerald-400">10 AM – 7 PM</p>
              </div>
            </div>

            {/* ── Date Selector ── */}
            <div>
              <SectionLabel icon={<Calendar size={13} />} text="Select Date" />
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {dates.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => setSelectedDate(d)}
                    className={`flex-shrink-0 w-[54px] rounded-2xl border py-2.5 text-center transition-all duration-150 ${
                      selectedDate.full === d.full
                        ? "border-violet-500 bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "border-slate-700 bg-slate-800 hover:border-violet-500/40 hover:bg-slate-700"
                    }`}
                  >
                    <p className={`text-[9px] font-bold uppercase ${selectedDate.full === d.full ? "text-violet-200" : "text-slate-500"}`}>{d.day}</p>
                    <p className={`text-lg font-black leading-tight ${selectedDate.full === d.full ? "text-white" : "text-slate-200"}`}>{d.num}</p>
                    <p className={`text-[9px] font-semibold ${selectedDate.full === d.full ? "text-violet-200" : "text-slate-500"}`}>{d.mon}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Time Slots Grid ── */}
            <div>
              <SectionLabel icon={<Clock size={13} />} text="Select Time Slot" />
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isBusy = BUSY_SLOTS.includes(time);
                  const isActive = bookingSlot === time;
                  return (
                    <button
                      key={time}
                      disabled={isBusy}
                      onClick={() => !isBusy && setBookingSlot(time)}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition-all duration-150 ${
                        isBusy
                          ? "cursor-not-allowed border-slate-800 bg-slate-800/40 text-slate-600"
                          : isActive
                          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/25"
                          : "border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500/50 hover:text-violet-300"
                      }`}
                    >
                      {time}
                      {isBusy && <span className="mt-0.5 block text-[9px] font-normal text-slate-600">Busy</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Mobile ── */}
            <div>
              <SectionLabel icon={<Phone size={13} />} text="Mobile Number" />
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 transition-all focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10">
                <span className="border-r border-slate-600 pr-3 text-xs font-bold text-violet-400">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:font-normal placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* ── Address ── */}
            <div>
              <SectionLabel icon={<MapPin size={13} />} text="Service Address" />
              <div className="flex gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 transition-all focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-slate-500" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no, street, landmark, city..."
                  className="flex-1 resize-none bg-transparent text-sm font-semibold text-white outline-none placeholder:font-normal placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* ── Description ── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel icon={<FileText size={13} />} text="Problem Description" noMargin />
                <span className="text-[10px] italic text-slate-500">Optional</span>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 transition-all focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10">
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue... (e.g. kitchen tap is leaking)"
                  className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* ── Payment ── */}
            <div>
              <SectionLabel icon={<CreditCard size={13} />} text="Payment Method" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "COD", icon: <Banknote size={18} />, name: "Cash on Delivery", desc: "Pay after service", color: "emerald" },
                  { id: "Online", icon: <CreditCard size={18} />, name: "Pay Online", desc: "Secure checkout", color: "violet" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={`rounded-2xl border p-3.5 text-left transition-all duration-150 ${
                      paymentMethod === p.id
                        ? p.color === "emerald"
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-violet-500/50 bg-violet-500/10"
                        : "border-slate-700 bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${
                      paymentMethod === p.id
                        ? p.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-violet-500/20 text-violet-400"
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {p.icon}
                    </div>
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{p.desc}</p>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {paymentMethod === "COD"
                  ? "Pay directly to provider after job is done."
                  : "Your payment will be processed securely online."}
              </p>
            </div>

            {/* ── Summary Strip ── */}
            <div className="flex items-center justify-around rounded-2xl border border-slate-700/50 bg-slate-800/50 py-3">
              <SummaryItem label="Date" value={selectedDate.label} />
              <div className="h-6 w-px bg-slate-700" />
              <SummaryItem label="Slot" value={bookingSlot || "—"} />
              <div className="h-6 w-px bg-slate-700" />
              <SummaryItem label="Pay" value={paymentMethod} />
            </div>

            {/* ── Footer Buttons ── */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <><CheckCircle size={17} /> {paymentMethod === "Online" ? "Pay Online" : "Confirm Booking"}</>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ── Helpers ──
function SectionLabel({ icon, text, noMargin }) {
  return (
    <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 ${noMargin ? "" : "mb-2"}`}>
      {icon} {text}
    </p>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-extrabold text-violet-400">{value}</p>
    </div>
  );
}

export default BookingModal;
