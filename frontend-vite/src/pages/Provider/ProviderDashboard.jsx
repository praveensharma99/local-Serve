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
  TrendingUp,
  Sparkles,
  DollarSign,
  CheckCircle2,
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
import ManageBookings from "./ManageBookings";
import { API_BASE_URL } from "../../config/api";

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
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
];

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const providerLocation =
    [providerData?.city, providerData?.state].filter(Boolean).join(", ") ||
    "India";
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("all"); // all | pending | accepted | rejected

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/provider/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProviderData(data.profile);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 1. Bookings fetch karne ka function
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
    } catch (err) {
      console.error("Error:", err);
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
      background: "#12142a", // Tere dashboard ka dark background
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
          background: "#12142a",
          color: "#fff",
        });
      }
    });
  };

  useEffect(() => {
    if (providerData && providerData.status !== "pending") fetchBookings();
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
    return { pending, accepted, rejected, dates, counts };
  }, [bookings]);

  const doughnutData = useMemo(() => ({
    labels: ['Pending', 'Confirmed', 'Rejected'],
    datasets: [{
      data: [chartData.pending, chartData.accepted, chartData.rejected],
      backgroundColor: [
        'rgba(251, 191, 36, 0.85)',
        'rgba(16, 185, 129, 0.85)',
        'rgba(244, 63, 94, 0.85)',
      ],
      borderColor: '#12142a',
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
        backgroundColor: '#12142a',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
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
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#12142a',
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
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#12142a', titleColor: '#fff', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
    },
  }), []);

  if (loading) return <LoadingScreen />;

  // --- PENDING STATE ---
  if (providerData?.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1a] p-6 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <Clock className="text-amber-500" size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          Verification Pending
        </h1>
        <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-medium">
          Bhai, tumhari details mil gayi hain. Admin verify kar raha hai.
          Approval ke baad saari features unlock ho jayengi.
        </p>
        <div className="mt-10 flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 text-sm font-bold bg-white/5 text-slate-300 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
          >
            Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-sm font-bold bg-violet-600 text-white rounded-2xl hover:bg-violet-500 shadow-lg shadow-violet-500/30 transition-all"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b1a] text-white flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* SIDEBAR - Matched with User Dashboard */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0e20] p-5">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/30 text-lg font-black">
            L
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-white">
              Local<span className="text-violet-400">Serve</span>
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Expert Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/30"
                    : "text-slate-400 hover:bg-violet-500/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" /> {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-400/20 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* TOPBAR - Matched */}
        <div className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0a0b1a]/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-8 py-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400">
                <Sparkles className="h-3.5 w-3.5" /> Provider Workspace
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">
                Welcome, {providerData?.name}!
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12142a] px-4 py-2.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-300">
                  {providerLocation}
                </span>
              </div>
              <button className="relative rounded-xl border border-white/[0.08] bg-[#12142a] p-2.5 text-slate-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-500"></span>
              </button>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-black text-white shadow-lg">
                {providerData?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Earnings" val="₹0" icon={<DollarSign size={18} />} color="emerald" />
                <StatCard label="Confirmed" val={chartData.accepted} icon={<CheckCircle2 size={18} />} color="violet" />
                <StatCard label="Profile Rating" val="5.0" icon={<Star size={18} />} color="amber" />
                <StatCard label="Pending" val={chartData.pending} icon={<Clock size={18} />} color="rose" />
              </div>

              {/* Charts + Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#12142a] p-6">
                  <div className="mb-5">
                    <h3 className="text-sm font-black text-white">Bookings Overview</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Status breakdown</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="relative flex-1 h-56">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-3xl font-black text-white">{chartData.pending + chartData.accepted + chartData.rejected}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Total</p>
                      </div>
                    </div>
                    <div className="w-36 space-y-4">
                      {[
                        { label: 'Pending', value: chartData.pending, dot: 'bg-amber-400', text: 'text-amber-400' },
                        { label: 'Confirmed', value: chartData.accepted, dot: 'bg-emerald-400', text: 'text-emerald-400' },
                        { label: 'Rejected', value: chartData.rejected, dot: 'bg-rose-400', text: 'text-rose-400' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${s.dot} shadow-sm`} />
                            <span className="text-xs font-bold text-slate-400">{s.label}</span>
                          </div>
                          <span className={`text-sm font-black ${s.text}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Requests Mini */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#12142a] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-white">Recent</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Latest requests</p>
                    </div>
                    <button onClick={() => setActiveTab("orders")} className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">View All</button>
                  </div>
                  <div className="space-y-2.5">
                    {bookings.slice(0, 6).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => setActiveTab("orders")}>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-md shadow-violet-500/10">
                          {booking.customer?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{booking.customer?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500">{new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {booking.bookingSlot || '--'}</p>
                        </div>
                        <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${booking.status === 'pending' ? 'bg-amber-400 shadow-sm shadow-amber-400/30' : booking.status === 'accepted' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30' : 'bg-rose-400 shadow-sm shadow-rose-400/30'}`} />
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-xs text-slate-500 font-medium">No requests yet</p>
                        <p className="text-[10px] text-slate-600 mt-1">New bookings appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Chart + Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#12142a] p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-black text-white">7-Day Activity</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Daily booking requests</p>
                  </div>
                  <div className="h-52">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>

                {/* Profile Card */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#12142a] p-6">
                  <h3 className="text-sm font-black text-white mb-5">Professional Identity</h3>
                  <div className="space-y-3.5">
                    <InfoRow label="Specialization" val={providerData?.category} />
                    <InfoRow label="Experience" val={`${providerData?.experience} Years`} />
                    <InfoRow label="Hourly Rate" val={`₹${providerData?.pricePerHour}/hr`} />
                    <InfoRow label="Service Mode" val="Home Visit" />
                    <InfoRow label="Location" val={providerLocation} />
                  </div>
                  <button className="w-full mt-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/20">
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

          {activeTab === "earnings" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <Wallet className="h-8 w-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Earnings</h2>
              <p className="text-sm text-slate-400">This section is coming soon.</p>
            </div>
          )}

          {activeTab === "profile" && <ProviderProfilePanel providerData={providerData} setProviderData={setProviderData} />}
        </main>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, val, icon, color }) {
  const styles = {
    violet: { border: "border-violet-500/20", iconBg: "bg-violet-500/10", iconText: "text-violet-400" },
    emerald: { border: "border-emerald-500/20", iconBg: "bg-emerald-500/10", iconText: "text-emerald-400" },
    amber: { border: "border-amber-500/20", iconBg: "bg-amber-500/10", iconText: "text-amber-400" },
    rose: { border: "border-rose-500/20", iconBg: "bg-rose-500/10", iconText: "text-rose-400" },
  };
  const s = styles[color];

  return (
    <div className={`rounded-2xl border ${s.border} p-5 flex items-center gap-4 bg-[#12142a] hover:border-white/[0.12] transition-all`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg} ${s.iconText}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <h3 className="text-xl font-black text-white mt-0.5">{val}</h3>
      </div>
    </div>
  );
}

function InfoRow({ label, val }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500 font-bold uppercase tracking-tighter">
        {label}
      </span>
      <span className="text-slate-200 font-black italic">
        {val || "Not Set"}
      </span>
    </div>
  );
}

function InfoChip({ label, val }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="break-words text-[11px] font-bold leading-relaxed text-slate-300">
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
        Swal.fire({ icon: 'success', title: 'Success!', text: data.message, timer: 2000, showConfirmButton: false, background: '#12142a', color: '#e2e8f0' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error!', text: data.message, background: '#12142a', color: '#e2e8f0' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error!', text: err.message, background: '#12142a', color: '#e2e8f0' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">Settings</p>
        <h2 className="text-2xl font-black text-white">Edit Profile</h2>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl rounded-2xl border border-white/[0.08] bg-[#12142a] p-6 sm:p-8">
        <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. Electrician"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. Delhi"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. Delhi NCR"
            />
          </div>
        </div>

        <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">Professional Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Experience (years)</label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. 5"
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price per Hour (₹)</label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="e.g. 500"
              min="0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-8 w-full sm:w-auto px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
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
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#0a0b1a]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
        <Loader2 className="animate-spin text-white" size={22} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Accessing Expert Panel...
      </p>
    </div>
  );
}
