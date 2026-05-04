import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Info,
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Briefcase,
  ArrowUpDown,
  MessageCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import ChatDrawer from "../../components/ChatDrawer";
import { API_BASE_URL } from "../../config/api";

export default function ManageBookings({
  bookings: bookingsProp,
  handleStatusUpdate: handleStatusUpdateProp,
  handleRejectConfirm: handleRejectConfirmProp,
}) {
  const [localBookings, setLocalBookings] = useState([]);
  const [loading, setLoading] = useState(!Array.isArray(bookingsProp));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const bookings = Array.isArray(bookingsProp) ? bookingsProp : localBookings;

  const fetchLocalBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/bookings/provider-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLocalBookings(data.bookings || []);
      } else {
        setLocalBookings([]);
        toast.error(data.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Provider bookings fetch error:", err);
      setLocalBookings([]);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(bookingsProp)) {
      setLoading(false);
      return;
    }
    fetchLocalBookings();
  }, [bookingsProp]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (handleStatusUpdateProp) {
      handleStatusUpdateProp(bookingId, newStatus);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/bookings/status/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Booking updated");
        fetchLocalBookings();
      } else {
        toast.error(data.message || "Status update failed");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Status update failed");
    }
  };

  const handleRejectConfirm = (bookingId) => {
    if (handleRejectConfirmProp) {
      handleRejectConfirmProp(bookingId);
      return;
    }
    if (window.confirm("Are you sure you want to reject this service request?")) {
      handleStatusUpdate(bookingId, "rejected");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/unread-counts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUnreadCounts(data.counts || {});
      } catch (err) {
        console.error("Unread count error:", err);
      }
    };

    fetchUnreadCounts();

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("chat_unread", ({ bookingId }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [bookingId]: (prev[bookingId] || 0) + 1,
      }));
    });

    socket.on("chat_read", ({ bookingId }) => {
      setUnreadCounts((prev) => ({ ...prev, [bookingId]: 0 }));
    });

    return () => socket.disconnect();
  }, []);

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(dateStr);
    bDate.setHours(0, 0, 0, 0);
    return bDate >= today;
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    const bDate = new Date(dateStr).toISOString().split("T")[0];
    return bDate === today;
  };

  const todayCount = bookings.filter((b) => isToday(b.bookingDate)).length;

  const stats = [
    { label: "Today's Requests", value: todayCount, color: "text-blue-400" },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      color: "text-amber-400",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "accepted").length,
      color: "text-emerald-400",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      color: "text-blue-400",
    },
  ];

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (b.customer?.name || "").toLowerCase().includes(q) ||
        (b.customerMobile || "").toLowerCase().includes(q) ||
        (b.customerAddress || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q) ||
        (b.bookingSlot || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.bookingDate).getTime();
      const dateB = new Date(b.bookingDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookings, statusFilter, searchQuery, sortOrder]);

  const upcoming = filteredBookings.filter((b) => isUpcoming(b.bookingDate));
  const past = filteredBookings.filter((b) => !isUpcoming(b.bookingDate));

  const statusBadge = (status) => {
    const map = {
      pending: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        label: "Pending",
      },
      accepted: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        label: "Confirmed",
      },
      rejected: {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
        label: "Rejected",
      },
      completed: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        label: "Completed",
      },
    };
    const s = map[status] || map.pending;
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}
      >
        {s.label}
      </span>
    );
  };

  const PaymentBadge = ({ booking }) => {
    const isPaid = booking.paymentStatus === "Paid";
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          isPaid
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}
      >
        {isPaid ? "Paid" : "COD"}
      </span>
    );
  };

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Confirmed" },
    { key: "rejected", label: "Rejected" },
    { key: "completed", label: "Completed" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
          <Clock className="h-5 w-5 animate-pulse text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">
            <Calendar className="h-3.5 w-3.5" /> Appointments
          </p>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Manage Bookings
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            All your service requests and appointments
          </p>
        </div>
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12142a] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all self-start sm:self-auto"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/[0.06] bg-[#12142a] p-6 text-center hover:border-white/[0.1] transition-all"
          >
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "bg-transparent text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#12142a] overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Customer
          </div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Date & Time
          </div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Slot
          </div>
          <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Payment
          </div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Status
          </div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
            Actions
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/[0.04]">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Customer */}
                <div className="sm:col-span-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-xs font-black text-white shadow-md shadow-violet-500/20 flex-shrink-0">
                    {booking.customer?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {booking.customer?.name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {booking.customerMobile || "No phone"}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-200">
                      {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {isToday(booking.bookingDate) && (
                      <span className="inline-flex rounded bg-blue-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/20">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Booked recently
                  </p>
                </div>

                {/* Slot */}
                <div className="sm:col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {booking.bookingSlot || "--"}
                  </span>
                </div>

                {/* Payment */}
                <div className="sm:col-span-1">
                  <PaymentBadge booking={booking} />
                </div>

                {/* Status */}
                <div className="sm:col-span-2 min-w-0">
                  {statusBadge(booking.status)}
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 flex items-center justify-end gap-2">
                  {["accepted", "completed"].includes(booking.status) && (
                    <button
                      onClick={() => {
                        setChatBooking(booking);
                        setUnreadCounts((prev) => ({ ...prev, [booking.id]: 0 }));
                      }}
                      className="relative h-8 w-8 rounded-full border border-violet-500/20 text-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-all"
                      title="Chat with customer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {(unreadCounts[booking.id] || 0) > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-[#12142a]">
                          {unreadCounts[booking.id] > 9 ? "9+" : unreadCounts[booking.id]}
                        </span>
                      )}
                    </button>
                  )}
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleRejectConfirm(booking.id)}
                        className="h-8 w-8 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
                        title="Reject"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking.id, "accepted")
                        }
                        className="h-8 w-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-400 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
                        title="Approve"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {booking.status === "accepted" && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, "completed")}
                      className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 hover:bg-blue-500/20 transition-all"
                      title="Mark as Completed"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">Complete</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="h-8 px-3 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-wider"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">Details</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                No bookings found
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result Count */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
      )}

      {/* Side Drawer */}
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          statusBadge={statusBadge}
          handleStatusUpdate={handleStatusUpdate}
          handleRejectConfirm={handleRejectConfirm}
        />
      )}

      {chatBooking && (
        <ChatDrawer
          booking={chatBooking}
          currentRole="provider"
          onRead={(bookingId) =>
            setUnreadCounts((prev) => ({ ...prev, [bookingId]: 0 }))
          }
          onClose={() => setChatBooking(null)}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-animate {
          animation: slideInRight 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function BookingDrawer({
  booking,
  onClose,
  statusBadge,
  handleStatusUpdate,
  handleRejectConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[#0d0e20] h-full border-l border-white/[0.08] overflow-y-auto drawer-animate">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0d0e20]/95 backdrop-blur-md px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">
              Booking Details
            </p>
            <h3 className="text-lg font-black text-white">Request Info</h3>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-violet-500/20">
              {booking.customer?.name?.charAt(0) || "?"}
            </div>
            <div>
              <h4 className="font-black text-base text-white">
                {booking.customer?.name || "Unknown Customer"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {booking.customer?.email || "No email provided"}
              </p>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Status
              </span>
              {statusBadge(booking.status)}
            </div>
            {booking.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleRejectConfirm(booking.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-black uppercase hover:bg-red-500/10 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(booking.id, "accepted");
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
              </div>
            )}
            {booking.status === "accepted" && (
              <button
                onClick={() => {
                  handleStatusUpdate(booking.id, "completed");
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
              >
                <Check className="h-3.5 w-3.5" />
                Mark as Completed
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DrawerItem
              icon={<Calendar className="h-3.5 w-3.5 text-violet-400" />}
              label="Date"
              value={new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <DrawerItem
              icon={<Clock className="h-3.5 w-3.5 text-violet-400" />}
              label="Slot"
              value={booking.bookingSlot || "Not specified"}
            />
            <DrawerItem
              icon={<Phone className="h-3.5 w-3.5 text-violet-400" />}
              label="Contact"
              value={booking.customerMobile || "Not provided"}
            />
            <DrawerItem
              icon={
                <span
                  className={`h-2 w-2 rounded-full ${
                    booking.paymentStatus === "Paid"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
              }
              label="Payment"
              value={booking.paymentMode || "COD"}
            />
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <MapPin className="h-3.5 w-3.5" /> Service Address
            </p>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {booking.customerAddress || "No address provided"}
            </p>
          </div>

          {/* Description */}
          {booking.description && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                <User className="h-3.5 w-3.5" /> Issue Description
              </p>
              <p className="text-sm text-slate-300 italic font-medium leading-relaxed">
                "{booking.description}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-200 break-words">{value}</p>
    </div>
  );
}
