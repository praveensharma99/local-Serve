import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  User,
  Bell,
  Clock,
  Star,
  MapPin,
  LogOut,
  Loader2,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { toast } from "react-toastify";
import ManageBookings from "./ManageBookings";
import ProviderMessages from "./ProviderMessages";
import { API_BASE_URL } from "../../config/api";
import { io } from 'socket.io-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const sidebarTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Manage Bookings", icon: Briefcase },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
];

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const selectTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const providerLocation =
    [providerData?.city, providerData?.state].filter(Boolean).join(", ") ||
    "India";
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("all"); // all | pending | accepted | rejected

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/provider/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Could not load your profile. Try again.");
          return;
        }
        if (data.profileExists === false) {
          navigate("/provider/onboarding", { replace: true });
          return;
        }
        if (data.profile) setProviderData(data.profile);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // 1. Bookings & Payments fetch karne ka function
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/provider-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setBookings(data.bookings);

      const payRes = await fetch(
        `${API_BASE_URL}/api/provider/payments/earnings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payData = await payRes.json();
      if (payData.success) setPayments(payData.payments);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // 2. Status update (Approve/Reject) karne ka function
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/status/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        fetchBookings(); // List refresh karo update ke baad
      }
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  //handle reject

  const handleRejectConfirm = (bookingId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to reject this service request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // Emerald-500 (Approve jaisa)
      cancelButtonColor: "#ef4444", // Red-500
      confirmButtonText: "Yes, Reject it!",
      cancelButtonText: "No, Keep it",
      background: "#0f172a",
      color: "#fff",
      borderRadius: "24px",
    }).then((result) => {
      if (result.isConfirmed) {
        // Agar user ne 'Yes' dabaya, tabhi handleStatusUpdate call hoga
        handleStatusUpdate(bookingId, "rejected");

        Swal.fire({
          title: "Rejected!",
          text: "Booking has been rejected.",
          icon: "success",
          background: "#0f172a",
          color: "#fff",
        });
      }
    });
  };

  useEffect(() => {
    if (providerData && providerData.status !== "pending") {
      fetchBookings();

      const token = localStorage.getItem('token');
      const socket = io(API_BASE_URL, { auth: { token } });

      socket.on('chat_unread', () => setUnreadCount(prev => prev + 1));
      socket.on('chat_read', () => {
        // Silently re-fetch unread count for accuracy
        fetch(`${API_BASE_URL}/api/chat/unread-counts`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
              setUnreadCount(total);
            }
          });
      });

      // Initial fetch
      fetch(`${API_BASE_URL}/api/chat/unread-counts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
            setUnreadCount(total);
          }
        });

      return () => socket.disconnect();
    }
  }, [providerData]);

  const chartData = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const accepted = bookings.filter(b => b.status === 'accepted').length;
    const rejected = bookings.filter(b => b.status === 'rejected').length;
    const dates = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const iso = d.toISOString().split('T')[0];
      dates.push(label);
      counts.push(bookings.filter(b => b.bookingDate === iso).length);
    }

    const earnings = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return { pending, accepted, rejected, dates, counts, earnings };
  }, [bookings, payments]);

  const doughnutData = useMemo(() => ({
    labels: ['Pending', 'Confirmed', 'Rejected'],
    datasets: [{
      data: [chartData.pending, chartData.accepted, chartData.rejected],
      backgroundColor: [
        'rgba(251, 191, 36, 0.85)',
        'rgba(16, 185, 129, 0.85)',
        'rgba(244, 63, 94, 0.85)',
      ],
      borderColor: '#020617',
      borderWidth: 4,
      hoverOffset: 8,
    }],
  }), [chartData.pending, chartData.accepted, chartData.rejected]);

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148,163,184,0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
        },
      },
    },
  }), []);

  const lineData = useMemo(() => ({
    labels: chartData.dates,
    datasets: [{
      label: 'Bookings',
      data: chartData.counts,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#020617',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.45,
    }],
  }), [chartData.dates, chartData.counts]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleColor: '#f8fafc', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
    },
  }), []);

  if (loading) return <LoadingScreen />;

  // --- PENDING STATE ---
  if (providerData?.status === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12 text-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10">
          <Clock className="text-amber-400" size={32} strokeWidth={1.75} />
        </div>
        <h1 className="mb-3 max-w-md text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Verification pending
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">
          Your details have been received. The admin is verifying them. All features will be unlocked after approval.
        </p>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
          >
            Refresh status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-900 transition-transform duration-200 ease-out lg:z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 px-6 py-6 bg-[#0f172a]/40">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-0.5 cursor-pointer group"
            >
              <img
                src="/images/logo3.png"
                alt="LocalServe logo"
                className="w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:drop-shadow-[0_0_28px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-all duration-300"
              />
              <div className="flex flex-col -ml-1">
                <span className="text-xl font-extrabold text-white tracking-tight leading-tight">
                  Local<span className="text-indigo-400">Serve</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-0.5">Expert Panel</span>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Provider sections">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const badge = tab.id === 'messages' && unreadCount > 0 ? unreadCount : null;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                    <span>{tab.label}</span>
                  </span>
                  {badge && (
                    <span className="shrink-0 rounded-md bg-indigo-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-800/80 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex shrink-0 rounded-lg py-1 outline-none ring-indigo-500/40 transition hover:bg-slate-900/80 focus-visible:ring-2 lg:hidden"
                aria-label="Home"
              >
                <img src="/images/logo3.png" alt="" className="h-8 w-8 object-contain" />
              </button>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">Provider workspace</span>
                </p>
                <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                  Welcome, {providerData?.name || "there"}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden max-w-[140px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 sm:flex md:max-w-[200px]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={1.75} />
                <span className="truncate text-xs font-medium text-slate-300">{providerLocation}</span>
              </div>
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </button>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-gradient-to-br from-indigo-600 to-indigo-500 text-xs font-semibold text-white"
                aria-hidden
              >
                {providerData?.name?.charAt(0) || "?"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp {
              animation: fadeInUp 0.5s ease-out forwards;
              opacity: 0;
            }
            .stat-card-hover {
              transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
            }
            .stat-card-hover:hover {
              transform: translateY(-2px);
              background-color: rgba(30, 41, 59, 0.6);
              border-color: rgba(99, 102, 241, 0.4);
            }
          `}</style>
          {activeTab === "dashboard" && (
            <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6 animate-fadeInUp">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard label="Total Earnings" val={`₹${chartData.earnings.toLocaleString('en-IN')}`} icon={Wallet} tone="text-emerald-400" bg="bg-emerald-400/10" hint="Lifetime earnings" />
                <StatCard label="Confirmed" val={chartData.accepted} icon={CheckCircle2} tone="text-violet-400" bg="bg-violet-400/10" hint="Active bookings" />
                <StatCard label="Profile Rating" val="5.0" icon={Star} tone="text-amber-400" bg="bg-amber-400/10" hint="Customer feedback" />
                <StatCard label="Pending" val={chartData.pending} icon={Clock} tone="text-rose-400" bg="bg-rose-400/10" hint="Needs action" />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6 lg:col-span-2">
                  <div className="mb-4 sm:mb-5">
                    <h3 className="text-sm font-semibold text-white">Bookings overview</h3>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Status breakdown</p>
                  </div>
                  <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-8">
                    <div className="relative mx-auto h-48 w-full max-w-[220px] sm:h-56 sm:max-w-[280px] sm:flex-1">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">
                          {chartData.pending + chartData.accepted + chartData.rejected}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">Total</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 sm:w-36 sm:flex-col sm:justify-center sm:gap-4 sm:pl-1">
                      {[
                        { label: 'Pending', value: chartData.pending, dot: 'bg-amber-400', text: 'text-amber-400' },
                        { label: 'Confirmed', value: chartData.accepted, dot: 'bg-emerald-400', text: 'text-emerald-400' },
                        { label: 'Rejected', value: chartData.rejected, dot: 'bg-rose-400', text: 'text-rose-400' },
                      ].map((s) => (
                        <div key={s.label} className="flex min-w-[120px] items-center justify-between gap-4 sm:w-full">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                            <span className="text-xs font-medium text-slate-400">{s.label}</span>
                          </div>
                          <span className={`text-sm font-semibold tabular-nums ${s.text}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Recent</h3>
                      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Latest requests</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab("orders")}
                      className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-indigo-400 transition hover:text-indigo-300"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {bookings.slice(0, 6).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/30 p-3 transition-colors hover:border-slate-700 hover:bg-slate-800/40"
                        onClick={() => selectTab("orders")}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-xs font-semibold text-white">
                          {booking.customer?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-white">{booking.customer?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {booking.bookingSlot || '--'}
                          </p>
                        </div>
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            booking.status === 'pending'
                              ? 'bg-amber-400'
                              : booking.status === 'accepted'
                                ? 'bg-emerald-400'
                                : 'bg-rose-400'
                          }`}
                        />
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="py-10 text-center">
                        <p className="text-xs font-medium text-slate-500">No requests yet</p>
                        <p className="mt-1 text-[10px] text-slate-600">New bookings appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-semibold text-white">7-day activity</h3>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Daily booking requests</p>
                  </div>
                  <div className="h-48 sm:h-52">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-6">
                  <h3 className="mb-4 text-sm font-semibold text-white sm:mb-5">Professional identity</h3>
                  <div className="space-y-3">
                    <InfoRow label="Specialization" val={providerData?.category} />
                    <InfoRow label="Experience" val={`${providerData?.experience} Years`} />
                    <InfoRow label="Hourly Rate" val={`₹${providerData?.pricePerHour}/hr`} />
                    <InfoRow label="Service Mode" val="Home Visit" />
                    <InfoRow label="Location" val={providerLocation} />
                  </div>
                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 sm:mt-6"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <ManageBookings
              bookings={bookings}
              handleStatusUpdate={handleStatusUpdate}
              handleRejectConfirm={handleRejectConfirm}
            />
          )}

          {activeTab === "messages" && <ProviderMessages />}

          {activeTab === "earnings" && (
            <div className="mx-auto max-w-5xl space-y-6 animate-fadeInUp">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Earnings & Payments</h2>
                  <p className="text-sm text-slate-400">Track your completed transactions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Lifetime Earnings</p>
                  <p className="text-3xl font-bold text-emerald-400">₹{chartData.earnings.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Total Transactions</p>
                  <p className="text-3xl font-bold text-white">{payments.length}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-semibold text-white">Transaction History</h3>
                </div>
                {payments.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {payments.map(p => (
                      <div key={p.id} className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            {p.customer?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{p.customer?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400">{p.booking?.serviceCategory} • TXN: {p.transactionId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 sm:justify-end">
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${p.paymentMethod === 'Online' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {p.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Wallet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">No earnings yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && <ProviderProfilePanel providerData={providerData} setProviderData={setProviderData} />}
        </main>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, val, icon: Icon, tone, bg, hint }) {
  return (
    <div className={`stat-card-hover w-full rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-left sm:rounded-2xl sm:p-5`}>
      <div className={`mb-3 w-fit rounded-lg p-2.5 sm:mb-4 sm:rounded-xl sm:p-3 ${bg} ${tone}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">{val}</h3>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function InfoRow({ label, val }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="shrink-0 font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="truncate text-right font-medium text-slate-200">
        {val || "Not Set"}
      </span>
    </div>
  );
}

function InfoChip({ label, val }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="break-words text-[11px] font-medium leading-relaxed text-slate-300">
        {val || "Not Set"}
      </p>
    </div>
  );
}

function ProviderProfilePanel({ providerData, setProviderData }) {
  const [formData, setFormData] = useState({
    name: providerData?.name || '',
    email: providerData?.email || '',
    city: providerData?.city || '',
    state: providerData?.state || '',
    phone: providerData?.phone || '',
    category: providerData?.category || '',
    experience: providerData?.experience || '',
    pricePerHour: providerData?.pricePerHour || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: providerData?.name || '',
      email: providerData?.email || '',
      city: providerData?.city || '',
      state: providerData?.state || '',
      phone: providerData?.phone || '',
      category: providerData?.category || '',
      experience: providerData?.experience || '',
      pricePerHour: providerData?.pricePerHour || '',
    });
  }, [providerData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/provider/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setProviderData({ ...providerData, ...formData });
        Swal.fire({ icon: 'success', title: 'Success!', text: data.message, timer: 2000, showConfirmButton: false, background: '#0f172a', color: '#e2e8f0' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error!', text: data.message, background: '#0f172a', color: '#e2e8f0' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error!', text: err.message, background: '#0f172a', color: '#e2e8f0' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">Settings</p>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Edit profile</h2>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-8">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Personal information</p>
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. Electrician"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. Delhi"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. Delhi NCR"
            />
          </div>
        </div>

        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Professional details</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Experience (years)</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. 5"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Price per hour (₹)</label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/30 transition focus:border-indigo-500/50 focus:ring-2"
              placeholder="e.g. 500"
              min="0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : null}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <img src="/images/logo3.png" alt="" className="h-10 w-10 object-contain opacity-90" />
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <Loader2 className="animate-spin text-indigo-400" size={20} strokeWidth={1.75} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Accessing expert panel…
      </p>
    </div>
  );
}
