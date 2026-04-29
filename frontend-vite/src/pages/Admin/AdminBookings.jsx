import React, { useState, useEffect } from "react";
import {
  Search, Calendar, Clock, MapPin, Phone, Loader2, Filter, Info, X,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";

const statusFilters = [
  { key: "all", label: "All", tone: "text-white bg-white/10 border-white/20" },
  { key: "pending", label: "Pending", tone: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { key: "accepted", label: "Accepted", tone: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { key: "rejected", label: "Rejected", tone: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  { key: "completed", label: "Completed", tone: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
];

const statusBadge = {
  pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  accepted: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  rejected: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  completed: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

const paymentTone = {
  Pending: "text-amber-400",
  Paid: "text-emerald-400",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [drawerBooking, setDrawerBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/admin/all-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings || []);
        } else {
          toast.error(data.message || "Failed to load bookings");
        }
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    let result = [...bookings];
    if (activeFilter !== "all") {
      result = result.filter((b) => b.status === activeFilter);
    }
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter((b) =>
        [
          b.serviceCategory,
          b.customer?.name,
          b.provider?.User?.name,
          b.customerMobile,
        ].some((v) => (v || "").toLowerCase().includes(term))
      );
    }
    setFiltered(result);
  }, [searchTerm, activeFilter, bookings]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
            <Loader2 className="animate-spin text-white" size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">All Bookings</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Platform-wide activity • {filtered.length} shown
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer, provider, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider border transition-all ${
              activeFilter === f.key
                ? f.tone
                : "bg-[#12142a] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12142a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">Service</th>
                <th className="px-5 py-4 font-bold">Customer</th>
                <th className="px-5 py-4 font-bold">Provider</th>
                <th className="px-5 py-4 font-bold">Date & Slot</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Payment</th>
                <th className="px-5 py-4 font-bold text-right">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b.id} className="group transition hover:bg-violet-500/5">
                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-violet-500/25 bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">
                        {b.serviceCategory}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-white">{b.customer?.name || "—"}</p>
                      <p className="text-[11px] text-slate-500">{b.customer?.email || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-white">{b.provider?.User?.name || "—"}</p>
                      <p className="text-[11px] text-slate-500">{b.provider?.User?.email || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {b.bookingDate
                          ? new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                          : "—"}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.bookingSlot || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusBadge[b.status] || statusBadge.pending}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-slate-300">{b.paymentMode}</div>
                      <div className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${paymentTone[b.paymentStatus] || "text-slate-500"}`}>
                        {b.paymentStatus}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDrawerBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
                      >
                        <Info className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <Filter className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">
                      {searchTerm ? "No bookings match your search." : "No bookings found on the platform."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerBooking && (
        <BookingDrawer booking={drawerBooking} onClose={() => setDrawerBooking(null)} />
      )}
    </div>
  );
}

function BookingDrawer({ booking, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-[999] h-full w-full max-w-md border-l border-white/[0.08] bg-[#0d0e20] shadow-2xl overflow-y-auto animate-slideInRight">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#0d0e20]/95 backdrop-blur-md px-6 py-4">
          <h2 className="text-lg font-black text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <DetailBlock label="Service Category" value={booking.serviceCategory} />
          <DetailBlock label="Status" value={booking.status} badge />
          <DetailBlock label="Customer" value={booking.customer?.name || "—"} sub={booking.customer?.email} />
          <DetailBlock label="Provider" value={booking.provider?.User?.name || "—"} sub={booking.provider?.User?.email} />
          <DetailBlock label="Booking Date" value={booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
          <DetailBlock label="Time Slot" value={booking.bookingSlot || "—"} />
          <DetailBlock label="Mobile" value={booking.customerMobile || "—"} />
          {booking.customerAddress && (
            <div className="rounded-xl border border-white/[0.06] bg-[#12142a] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Address</p>
              <p className="text-sm font-bold text-white">{booking.customerAddress}</p>
            </div>
          )}
          {booking.description && (
            <div className="rounded-xl border border-white/[0.06] bg-[#12142a] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-300">{booking.description}</p>
            </div>
          )}
          <div className="rounded-xl border border-white/[0.06] bg-[#12142a] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Payment</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{booking.paymentMode}</span>
              <span className={`text-xs font-black uppercase tracking-wider ${paymentTone[booking.paymentStatus] || "text-slate-500"}`}>
                {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slideInRight {
            animation: slideInRight 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
}

function DetailBlock({ label, value, sub, badge }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#12142a] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      {badge ? (
        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusBadge[value] || statusBadge.pending}`}>
          {value}
        </span>
      ) : (
        <>
          <p className="text-sm font-bold text-white">{value}</p>
          {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
        </>
      )}
    </div>
  );
}
