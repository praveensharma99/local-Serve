import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CreditCard,
  History,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Briefcase,
  Loader2,
  Download
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function UserPayments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/user/payments/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.payments)) {
          setBookings(data.payments);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Fetch payments error:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const stats = [
    {
      label: "Total Transactions",
      value: bookings.length,
      color: "text-violet-400",
      border: "border-violet-500/20",
      bg: "bg-violet-500/10",
    },
    {
      label: "Paid",
      value: bookings.filter((b) => b.paymentStatus === "Paid").length,
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.paymentStatus === "Pending").length,
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    },
    {
      label: "Total Spent",
      value: `₹${bookings
        .filter((b) => b.paymentStatus === "Completed")
        .reduce((sum, b) => sum + Number(b.amount || 0), 0)
        .toLocaleString('en-IN')}`,
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
    },
  ];

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.paymentStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (b.booking?.serviceCategory || "").toLowerCase().includes(q) ||
        (b.provider?.user?.name || "").toLowerCase().includes(q) ||
        (b.transactionId || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookings, statusFilter, searchQuery, sortOrder]);

  const PaymentBadge = ({ booking }) => {
    const isPaid = booking.paymentStatus === "Completed";
    const isOnline = booking.paymentMethod === "Online";
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          isPaid
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}
      >
        {booking.paymentStatus}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (!price) return "—";
    return `₹${Number(price).toFixed(0)}`;
  };

  const PaymentRow = ({ booking }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,2fr)_150px_120px_120px_140px] gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-b-0">
        {/* Service */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            {booking.booking?.serviceCategory?.charAt(0) || "S"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {booking.booking?.serviceCategory || "Service"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {booking.provider?.user?.name || "Provider"}
            </p>
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 truncate" title={booking.transactionId}>
            {booking.transactionId}
          </p>
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm font-black text-emerald-400">
            {formatPrice(booking.amount)}
          </p>
        </div>

        {/* Date */}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-200">
              {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-start">
          <PaymentBadge booking={booking} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading your payments...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
            <CreditCard className="h-3.5 w-3.5" /> Billing & Payments
          </p>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Payment History
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            View all your past transactions and payment statuses
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} bg-[#12142a] p-5 text-center hover:border-white/[0.12] transition-all`}
          >
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by service, provider, or TXN ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All" },
              { key: "Paid", label: "Paid" },
              { key: "Pending", label: "Pending" },
            ].map((f) => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
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
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Transaction History
          </h3>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-bold text-slate-600">{filteredBookings.length} records</span>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-[minmax(180px,2fr)_150px_120px_120px_140px] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">TXN ID</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</div>
        </div>

        {/* Rows */}
        {filteredBookings.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {filteredBookings.map((b) => (
              <PaymentRow key={b.id} booking={b} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <History className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-400">No transactions found</p>
            <p className="text-xs text-slate-600 mt-1">Your payment history will appear here once you book a service.</p>
          </div>
        )}
      </div>
    </div>
  );
}
