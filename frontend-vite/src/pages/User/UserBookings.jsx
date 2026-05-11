import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Info,
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Briefcase,
  Loader2,
  History,
  CreditCard,
  ArrowUpDown,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import ChatDrawer from "../../components/ChatDrawer";
import { API_BASE_URL } from "../../config/api";
import { loadRazorpayCheckout } from "../../utils/loadRazorpayCheckout";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [payingId, setPayingId] = useState(null);
  const [viewMode, setViewMode] = useState("upcoming");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Fetch bookings error:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

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

  const handlePayNow = async (bookingId) => {
    setPayingId(bookingId);
    try {
      const token = localStorage.getItem("token");

      // 1. Create Razorpay order from backend
      const orderRes = await fetch(
        `${API_BASE_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        }
      );
      const orderData = await orderRes.json();

      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create payment order");
        return;
      }

      const rzpLoaded = await loadRazorpayCheckout();
      if (!rzpLoaded) {
        toast.error("Razorpay checkout could not load. Please try again.");
        return;
      }

      // 2. Open Razorpay Checkout
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "LocalServe",
        description: "Service Booking Payment",
        order_id: orderData.order.id,
        handler: async (response) => {
          // 3. Verify payment on backend
          const verifyRes = await fetch(
            `${API_BASE_URL}/api/payments/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("Payment successful!");
            setBookings((prev) =>
              prev.map((b) =>
                b.id === bookingId ? { ...b, paymentStatus: "Paid" } : b
              )
            );
          } else {
            toast.error(verifyData.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed: " + response.error.description);
      });
    } catch (err) {
      toast.error("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setPayingId(null);
    }
  };

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

  const checkIsExpired = (dateStr, slotStr) => {
    if (!dateStr || !slotStr) return false;
    try {
      const bDate = new Date(dateStr);
      const timeParts = String(slotStr).split('-');
      if (timeParts.length < 2) {
         bDate.setHours(23, 59, 59, 999);
         return bDate < new Date();
      }
      
      const endTimeStr = timeParts[1].trim();
      const timeMatch = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
         bDate.setHours(23, 59, 59, 999);
         return bDate < new Date();
      }
      
      let [_, hours, minutes, ampm] = timeMatch;
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      bDate.setHours(hours, minutes, 0, 0);
      return bDate < new Date();
    } catch (e) {
      return false;
    }
  };

  const stats = [
    {
      label: "Total",
      value: bookings.length,
      color: "text-violet-400",
      border: "border-violet-500/20",
      bg: "bg-violet-500/10",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "accepted").length,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
    },
    {
      label: "Rejected",
      value: bookings.filter((b) => b.status === "rejected").length,
      color: "text-rose-400",
      border: "border-rose-500/20",
      bg: "bg-rose-500/10",
    },
  ];

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (b.serviceCategory || "").toLowerCase().includes(q) ||
        (b.provider?.User?.name || "").toLowerCase().includes(q) ||
        (b.bookingSlot || "").toLowerCase().includes(q) ||
        (b.customerAddress || "").toLowerCase().includes(q);
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
  const displayBookings = viewMode === "upcoming" ? upcoming : past;

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    const labels = {
      pending: "Pending",
      accepted: "Confirmed",
      rejected: "Rejected",
      completed: "Completed",
    };
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const PaymentBadge = ({ booking }) => {
    const isPaid = booking.paymentStatus === "Paid";
    const isOnline = booking.paymentMode === "Online";
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          isPaid
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : isOnline
            ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}
      >
        {isPaid ? "Paid" : isOnline ? "Online Pending" : "COD"}
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

  const formatPrice = (price) => {
    if (!price) return "—";
    return `₹${Number(price).toFixed(0)}/hr`;
  };

  const BookingRow = ({ booking }) => {
    const expired = checkIsExpired(booking.bookingDate, booking.bookingSlot);
    const isCompletedOrCancelled = ["completed", "rejected", "cancelled"].includes(booking.status);
    const disableActions = expired || isCompletedOrCancelled;

    const showPayNow = booking.status === "accepted" && booking.paymentStatus !== "Paid";
    const showChat = ["accepted", "completed"].includes(booking.status); // Will be disabled if completed based on disableActions
    const unreadCount = unreadCounts[booking.id] || 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,2fr)_90px_180px_120px_110px_130px_132px] gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-b-0">
        {/* Service */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-xs font-black text-white shadow-md shadow-violet-500/20 flex-shrink-0">
            {booking.serviceCategory?.charAt(0) || "S"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {booking.serviceCategory || "Service"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {booking.provider?.User?.name || booking.provider?.category || "Provider"}
            </p>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs font-black text-violet-300">
            {formatPrice(booking.provider?.pricePerHour)}
          </p>
        </div>

        {/* Date */}
        <div>
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
        </div>

        {/* Slot */}
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Clock className="h-3 w-3 text-slate-500" />
            {booking.bookingSlot || "--"}
          </span>
        </div>

        {/* Payment */}
        <div>
          <PaymentBadge booking={booking} />
        </div>

        {/* Status */}
        <div className="min-w-0">
          <div className="flex flex-col gap-1.5 items-start">
            {statusBadge(booking.status)}
            {expired && booking.status === "accepted" && (
              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border bg-rose-500/10 text-rose-400 border-rose-500/20" title="Service window ended">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-start sm:justify-end gap-2">
          {showChat && (
            <button
              onClick={() => {
                if (disableActions) return;
                setChatBooking(booking);
                setUnreadCounts((prev) => ({ ...prev, [booking.id]: 0 }));
              }}
              disabled={disableActions}
              title={disableActions ? "Service window ended" : "Chat with provider"}
              className={`relative h-8 w-8 shrink-0 rounded-full border flex items-center justify-center transition-all ${
                disableActions 
                  ? "border-slate-500/20 text-slate-500 bg-slate-500/5 cursor-not-allowed opacity-60"
                  : "border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {unreadCount > 0 && !disableActions && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-[#12142a]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}
          {showPayNow && (
            <button
              onClick={() => {
                if (!disableActions) handlePayNow(booking.id);
              }}
              disabled={payingId === booking.id || disableActions}
              title={disableActions ? "Booking time has expired" : "Pay for service"}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${
                disableActions
                  ? "bg-slate-500/5 border-slate-500/20 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
              }`}
            >
              <CreditCard className="h-3 w-3" />
              {payingId === booking.id ? "..." : "Pay"}
            </button>
          )}
          <button
            onClick={() => setSelectedBooking(booking)}
            className="h-8 w-8 shrink-0 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
            title="View Details"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading your bookings...
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
            <History className="h-3.5 w-3.5" /> My Bookings
          </p>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Booking History
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Track and manage all your service requests
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} bg-[#12142a] p-5 text-center hover:border-white/[0.12] transition-all`}
          >
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* View Toggle + Search + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("upcoming")}
            className={`rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${
              viewMode === "upcoming"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-transparent text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={`rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${
              viewMode === "history"
                ? "bg-slate-500 text-white shadow-lg shadow-slate-500/20"
                : "bg-transparent text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            History
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by service, provider, address..."
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#12142a] overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <h3 className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'upcoming' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {viewMode === 'upcoming' ? 'Upcoming Bookings' : 'Booking History'}
          </h3>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-bold text-slate-600">{displayBookings.length}</span>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-[minmax(180px,2fr)_90px_180px_120px_110px_130px_132px] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Service
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Price
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Date
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Slot
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Payment
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Status
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
            Actions
          </div>
        </div>

        {/* Rows */}
        {displayBookings.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {displayBookings.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              {viewMode === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {viewMode === 'upcoming' ? 'Book a service to see upcoming appointments here.' : 'Your completed and rejected bookings will appear here.'}
            </p>
          </div>
        )}
      </div>

      {/* Result Count */}
      {displayBookings.length > 0 && (
        <div className="flex justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Showing {displayBookings.length} {viewMode === 'upcoming' ? 'upcoming' : 'past'} of {bookings.length} total bookings
          </p>
        </div>
      )}

      {/* Drawer */}
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          PaymentBadge={PaymentBadge}
          statusBadge={statusBadge}
          formatPrice={formatPrice}
        />
      )}

      {chatBooking && (
        <ChatDrawer
          booking={chatBooking}
          currentRole="user"
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

function BookingDrawer({ booking, onClose, PaymentBadge, statusBadge, formatPrice }) {
  const providerName = booking.provider?.User?.name || "Provider";
  const providerCategory = booking.provider?.category || booking.serviceCategory;

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
            <h3 className="text-lg font-black text-white">Your Request</h3>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-violet-500/20">
              {providerName.charAt(0)}
            </div>
            <div>
              <h4 className="font-black text-base text-white">{providerName}</h4>
              <p className="text-xs text-slate-400">{providerCategory}</p>
            </div>
          </div>

          {/* Status + Price */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Status
              </span>
              {statusBadge(booking.status)}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</p>
              <p className="text-sm font-black text-violet-300">{formatPrice(booking.provider?.pricePerHour)}</p>
            </div>
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
              value={booking.bookingSlot || "--"}
            />
            <DrawerItem
              icon={<Phone className="h-3.5 w-3.5 text-violet-400" />}
              label="Contact"
              value={booking.customerMobile || "--"}
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
              value={<PaymentBadge booking={booking} />}
            />
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <MapPin className="h-3.5 w-3.5" /> Service Address
            </p>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              {booking.customerAddress || "Not provided"}
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
      <div className="text-xs font-bold text-slate-200 break-words">{value}</div>
    </div>
  );
}

