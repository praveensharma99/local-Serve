

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UsersProviders from "./UsersProviders";
import AdminBookings from "./AdminBookings";
import AddService from "./AddService";

import {
  LayoutDashboard, Users, Wrench, LogOut,
  CheckCircle, XCircle, Loader2, PlusSquare, Search, Bell,
  Clock, IndianRupee, CalendarDays, AlertTriangle, FileText,
  Sparkles, RefreshCw, MapPin, BarChart3, PieChart, TrendingUp,
  Menu, X,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const sidebarTabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users-providers", label: "Users & Providers", icon: Users },
  { id: "add-service", label: "Add Service", icon: PlusSquare },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "revenue", label: "Revenue", icon: IndianRupee },
  { id: "disputes", label: "Disputes", icon: AlertTriangle, count: "2" },
];

const emptyStats = { users: 0, providers: 0, pending: 0, revenue: "0" };

function normalizeStats(stats = {}) {
  return {
    users: stats.users ?? stats.totalUsers ?? 0,
    providers: stats.providers ?? stats.totalProviders ?? 0,
    pending: stats.pending ?? stats.totalPending ?? 0,
    revenue: stats.revenue ?? stats.totalRevenue ?? "0",
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [bookingStats, setBookingStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to load dashboard data");
      setStats(normalizeStats(data.stats));
      setPendingQueue(data.pendingQueue || []);
      setError("");
      // Fetch booking stats silently
      try {
        const bsRes = await fetch(`${API_BASE_URL}/api/admin/booking-stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const bsData = await bsRes.json();
        if (bsData.success) setBookingStats(bsData);
      } catch { /* ignore */ }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      toast.error("Dashboard load nahi ho pa raha");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== "overview") setSearch("");
  };

  const selectTab = (tabId) => {
    handleTabChange(tabId);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProviderAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/${action}-provider/${id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || `${action} failed`);
      setPendingQueue((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => ({
        ...prev,
        pending: Math.max(Number(prev.pending) - 1, 0),
        providers: action === "approve" ? Number(prev.providers) + 1 : prev.providers,
      }));
      toast.success(action === "approve" ? "Provider approved successfully" : "Provider rejected");
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading) return <LoadingScreen />;

  const searchText = search.trim().toLowerCase();
  const filteredQueue = pendingQueue.filter((item) =>
    [item.name, item.email, item.category].some((v) =>
      String(v || "").toLowerCase().includes(searchText)
    )
  );

  const cards = [
    { label: "Revenue", value: `₹${stats.revenue}`, icon: IndianRupee, tone: "text-emerald-400", bg: "bg-emerald-400/10", hint: "Total platform earnings" },
    { label: "Users", value: stats.users, icon: Users, tone: "text-cyan-400", bg: "bg-cyan-400/10", hint: "Registered customers", tab: "users-providers" },
    { label: "Providers", value: stats.providers, icon: Wrench, tone: "text-violet-400", bg: "bg-violet-400/10", hint: "Approved partners", tab: "users-providers" },
    { label: "Pending", value: stats.pending, icon: Clock, tone: "text-amber-400", bg: "bg-amber-400/10", hint: "Needs review" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
          <BrandBlock
            onLogoClick={() => navigate("/")}
            onCloseMobile={() => setSidebarOpen(false)}
          />
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Admin sections">
            {sidebarTabs.map((tab) => (
              <SidebarButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => selectTab(tab.id)}
              />
            ))}
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
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <button
                type="button"
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Open menu"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-0.5 shrink-0 rounded-lg py-0.5 outline-none ring-indigo-500/40 transition hover:bg-slate-900/80 focus-visible:ring-2 lg:hidden"
                aria-label="Home"
              >
                <img src="/images/logo3.png" alt="" className="h-9 w-9 object-contain" />
              </button>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">Admin workspace</span>
                </p>
                <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-white sm:text-xl lg:text-2xl">
                  {activeTab === "overview" ? "Command center" : sidebarTabs.find((t) => t.id === activeTab)?.label}
                </h1>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:max-w-xl">
                <div className="relative w-full min-w-0 sm:min-w-[220px] sm:flex-1 lg:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.75} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pending providers..."
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-indigo-500/30 placeholder:text-slate-500 transition focus:border-indigo-500/50 focus:ring-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchDashboardData({ silent: true })}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white sm:flex-none"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.75} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900 text-slate-400 transition hover:border-slate-600 hover:text-slate-100"
                    aria-label="Notifications"
                  >
                    <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <OverviewPanel
              cards={cards} error={error}
              filteredQueue={filteredQueue} pendingQueue={pendingQueue}
              bookingStats={bookingStats}
              onOpenTab={selectTab}
              onApprove={(id) => handleProviderAction(id, "approve")}
              onReject={(id) => handleProviderAction(id, "reject")}
            />
          )}
          {activeTab === "users-providers" && <UsersProviders />}
          {activeTab === "bookings" && <AdminBookings />}
          {activeTab === "add-service" && <AddService />}
          {!["overview", "users-providers", "bookings", "add-service"].includes(activeTab) && (
            <ComingSoon activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── REUSABLE COMPONENTS ─────────────────────────────────────── */

function BrandBlock({ onLogoClick, onCloseMobile }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-4">
      <button
        type="button"
        onClick={onLogoClick}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none ring-indigo-500/40 transition hover:bg-slate-800/50 focus-visible:ring-2"
      >
        <img
          src="/images/logo3.png"
          alt="LocalServe"
          className="h-9 w-9 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">
            Local<span className="text-indigo-400">Serve</span>
          </p>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
      </button>
      {onCloseMobile ? (
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}

function SidebarButton({ tab, active, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-slate-800 text-white shadow-sm"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
        <span className="truncate">{tab.label}</span>
      </span>
      {tab.count ? (
        <span className="shrink-0 rounded-md bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
          {tab.count}
        </span>
      ) : null}
    </button>
  );
}

function OverviewPanel({ cards, error, filteredQueue, pendingQueue, bookingStats, onOpenTab, onApprove, onReject }) {
  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
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
        }
      `}</style>

      {error && (
        <div className="animate-fadeInUp rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>
      )}
      <section className="grid animate-fadeInUp gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4" style={{ animationDelay: '0.08s' }}>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} onClick={card.tab ? () => onOpenTab(card.tab) : undefined} />
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid animate-fadeInUp gap-3 sm:grid-cols-2 sm:gap-4" style={{ animationDelay: '0.18s' }}>
        <StatusDonutChart stats={bookingStats?.statusCounts} total={bookingStats?.totalBookings} />
        <PaymentModeChart data={bookingStats?.paymentDistribution} />
        <MonthlyBarChart data={bookingStats?.monthlyBookings} />
        <CategoryDistributionChart pendingQueue={pendingQueue} />
      </section>

      <section className="grid animate-fadeInUp gap-5 xl:grid-cols-[1fr_minmax(0,340px)] xl:gap-6" style={{ animationDelay: '0.28s' }}>
        <PendingProvidersTable filteredQueue={filteredQueue} pendingQueue={pendingQueue} onApprove={onApprove} onReject={onReject} />
        <ReviewSummary pendingQueue={pendingQueue} />
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, tone, bg, hint, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`stat-card-hover w-full rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-left sm:rounded-2xl sm:p-5 ${
        onClick ? "cursor-pointer hover:border-indigo-500/40 hover:bg-slate-800/50" : ""
      }`}
    >
      <div className={`mb-3 w-fit rounded-lg p-2.5 sm:mb-4 sm:rounded-xl sm:p-3 ${bg} ${tone}`}>
        {React.createElement(icon, { className: "h-5 w-5", strokeWidth: 1.75 })}
      </div>
      <h2 className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">{value}</h2>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </Tag>
  );
}

function PendingProvidersTable({ filteredQueue, pendingQueue, onApprove, onReject }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 sm:rounded-2xl">
      <div className="flex flex-col gap-2 border-b border-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-base font-semibold text-white">Pending provider approvals</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {filteredQueue.length} visible from {pendingQueue.length} total
          </p>
        </div>
        <span className="w-fit rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-200">
          Review queue
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-800/80 text-xs font-medium uppercase tracking-wider text-slate-500">
            <tr>
              {["Provider", "Service", "Docs", "Location", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-4 ${i === 4 ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item) => (
                <ProviderRow key={item.id} item={item} onApprove={() => onApprove(item.id)} onReject={() => onReject(item.id)} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500">
                  No pending providers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProviderRow({ item, onApprove, onReject }) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "Provider")}&background=7c5cfc&color=ffffff&bold=true`;
  const profilePath = item.profile_pic_url ? item.profile_pic_url.replace(/\\/g, "/") : "";
  const profileUrl = profilePath ? `${API_BASE_URL}/${profilePath}` : avatarUrl;
  const docPath = item.aadhar_pdf_url ? item.aadhar_pdf_url.replace(/\\/g, "/") : "";

  const handleRejectClick = () => {
    if (window.confirm(`Are you sure you want to reject ${item.name || "this provider"}?`)) onReject();
  };

  return (
    <tr className="transition hover:bg-slate-800/30">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <img src={profileUrl} alt={item.name || "Provider"}
            className="h-10 w-10 rounded-xl object-cover border border-white/10"
            onError={(e) => (e.currentTarget.src = avatarUrl)} />
          <div>
            <p className="font-bold text-white">{item.name || "Unnamed provider"}</p>
            <p className="text-xs text-slate-500">{item.email || "No email added"}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          {item.category || "General"}
        </span>
        {item.price_per_hour && <p className="mt-1.5 text-xs text-slate-500">₹{item.price_per_hour}/hr</p>}
      </td>
      <td className="px-5 py-4">
        {docPath ? (
          <a href={`${API_BASE_URL}/${docPath}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/40 hover:text-indigo-300">
            <FileText className="h-3.5 w-3.5" /> View PDF
          </a>
        ) : (
          <span className="text-xs text-slate-600">Missing docs</span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-emerald-400" />
          <span className="text-sm text-slate-300">{item.city ? `${item.city}, ${item.state}` : "Unknown"}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onApprove}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500">
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> Approve
          </button>
          <button type="button" onClick={handleRejectClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-950/40">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReviewSummary({ pendingQueue }) {
  const topServices = pendingQueue.reduce((acc, item) => {
    const key = item.category || "General";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const colors = [
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  ];

  return (
    <aside className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:rounded-2xl sm:p-5">
      <h2 className="text-base font-semibold text-white">Queue health</h2>
      <p className="mt-1 text-xs text-slate-500">Services waiting for admin approval.</p>
      <div className="mt-5 space-y-2.5">
        {Object.keys(topServices).length > 0 ? (
          Object.entries(topServices).map(([service, count], i) => (
            <div key={service} className={`flex items-center justify-between rounded-lg border p-3 sm:rounded-xl sm:p-3.5 ${colors[i % colors.length]}`}>
              <span className="text-sm font-medium">{service}</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            Queue clear hai. Nice.
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── CHART COMPONENTS ─────────────────────────────────────────── */

function ChartCard({ icon: Icon, title, subtitle, children, hasData }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 sm:rounded-2xl sm:p-5">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/60 bg-slate-950/50 text-indigo-400">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-3 flex-1">
        {hasData ? children : (
          <div className="flex h-36 flex-col items-center justify-center text-center sm:h-40">
            <BarChart3 className="mb-2 h-8 w-8 text-slate-600" strokeWidth={1.5} />
            <p className="text-xs font-medium text-slate-500">No data available yet</p>
            <p className="mt-0.5 text-[10px] text-slate-600">Data will appear once activity begins</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDonutChart({ stats, total }) {
  const hasData = stats && total && total > 0;
  const r = 45;
  const c = 2 * Math.PI * r;
  const colors = { pending: '#fbbf24', accepted: '#34d399', rejected: '#f87171', completed: '#60a5fa' };
  const labels = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', completed: 'Completed' };

  let offset = 0;
  const segments = hasData
    ? Object.entries(stats)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const dash = (value / total) * c;
        const seg = { key, value, dash, offset, color: colors[key], label: labels[key] };
        offset -= dash;
        return seg;
      })
    : [];

  return (
    <ChartCard icon={PieChart} title="Booking Status" subtitle="Distribution by current state" hasData={hasData}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(51,65,85,0.5)" strokeWidth="12" />
            {segments.map((s) => (
              <circle key={s.key} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="12"
                strokeDasharray={`${s.dash} ${c}`} strokeDashoffset={s.offset} strokeLinecap="round" />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-lg font-semibold tabular-nums text-white">{total}</p>
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">Bookings</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-xs text-slate-400 flex-1">{s.label}</span>
              <span className="text-xs font-semibold tabular-nums text-white">{s.value}</span>
              <span className="w-8 text-right text-[10px] text-slate-500">{Math.round((s.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

function MonthlyBarChart({ data }) {
  const hasData = data && data.length > 0;
  const max = hasData ? Math.max(...data.map((d) => d.count)) : 0;
  return (
    <ChartCard icon={TrendingUp} title="Monthly Bookings" subtitle="Last 6 months activity" hasData={hasData}>
      {hasData && (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.month} className="flex items-center gap-3">
              <span className="w-10 text-[10px] font-bold uppercase tracking-wider text-slate-500">{d.month}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-slate-950/60">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all"
                  style={{ width: `${max ? (d.count / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-5 text-right text-xs font-semibold tabular-nums text-white">{d.count}</span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

function PaymentModeChart({ data }) {
  const hasData = data && ((data.COD || 0) + (data.Online || 0)) > 0;
  const total = hasData ? (data.COD || 0) + (data.Online || 0) : 0;
  const items = [
    { label: 'Cash on Delivery', value: data?.COD || 0, barColor: '#f59e0b' },
    { label: 'Online Payment', value: data?.Online || 0, barColor: '#10b981' },
  ];
  return (
    <ChartCard icon={IndianRupee} title="Payment Modes" subtitle="Transaction method split" hasData={hasData}>
      <div className="space-y-4">
        {items.map((item) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
                <span className="text-xs font-semibold tabular-nums text-white">{item.value} <span className="font-normal text-slate-500">({pct}%)</span></span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-950/60">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: item.barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 text-center sm:mt-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Total transactions</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{total}</p>
      </div>
    </ChartCard>
  );
}

function CategoryDistributionChart({ pendingQueue }) {
  const hasData = pendingQueue && pendingQueue.length > 0;
  const counts = hasData
    ? pendingQueue.reduce((acc, item) => {
      const cat = item.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
    : {};
  const chartData = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
  const max = chartData.length > 0 ? Math.max(...chartData.map((d) => d.count)) : 0;
  const barColors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  return (
    <ChartCard icon={BarChart3} title="Pending by Category" subtitle="Service categories awaiting approval" hasData={hasData}>
      <div className="space-y-3">
        {chartData.map((d, i) => (
          <div key={d.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300">{d.category}</span>
              <span className="text-xs font-semibold tabular-nums text-white">{d.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/60">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${max ? (d.count / max) * 100 : 0}%`, background: barColors[i % barColors.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function ComingSoon({ activeTab }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30 p-6 text-center sm:min-h-[55vh]">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">Coming soon</p>
        <h2 className="mt-2 text-xl font-semibold capitalize text-white sm:text-2xl">{activeTab}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">This section is ready for the next backend screen.</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6">
      <img src="/images/logo3.png" alt="" className="h-10 w-10 object-contain opacity-90" />
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <Loader2 className="animate-spin text-indigo-400" size={20} strokeWidth={1.75} />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Loading admin dashboard</p>
    </div>
  );
}




// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import UserList from "./UserList"; // 👈 Make sure UserList.jsx is in the same folder
// import ApprovedProviders from "./ApprovedProviders";
// import AddService from "./AddService";

// import {
//   LayoutDashboard,
//   Users,
//   Wrench,
//   CalendarDays,
//   IndianRupee,
//   AlertTriangle,
//   LogOut,
//   ShieldCheck,
//   FileText,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   PlusSquare,
// } from "lucide-react";

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const navigate = useNavigate();

//   const [stats, setStats] = useState({
//     users: 0,
//     providers: 0,
//     pending: 0,
//     revenue: "0",
//   });
//   const [pendingQueue, setPendingQueue] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 1. Fetch Admin Stats & Pending Approvals
//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(
//           "http://localhost:5000/api/admin/dashboard-stats",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         const data = await res.json();
//         if (data.success) {
//           setStats(data.stats);
//           setPendingQueue(data.pendingQueue || []);
//         }
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         toast.error("Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAdminData();
//   }, []);

//   // 2. Approve Logic
//   const handleApprove = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `http://localhost:5000/api/admin/approve-provider/${id}`,
//         {
//           method: "PUT",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.ok) {
//         setPendingQueue(pendingQueue.filter((item) => item.id !== id));
//         setStats((prev) => ({
//           ...prev,
//           pending: prev.pending - 1,
//           providers: prev.providers + 1,
//         }));
//         toast.success("Provider Verified Successfully! ✅");
//       }
//     } catch (err) {
//       toast.error("Approval failed");
//     }
//   };

//   // 3. Reject Logic
//   const handleReject = async (id) => {
//     if (!window.confirm("Are you sure you want to reject this provider?"))
//       return;
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `http://localhost:5000/api/admin/reject-provider/${id}`,
//         {
//           method: "PUT",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       if (res.ok) {
//         setPendingQueue(pendingQueue.filter((item) => item.id !== id));
//         setStats((prev) => ({ ...prev, pending: prev.pending - 1 }));
//         toast.error("Provider Rejected! ❌");
//       }
//     } catch (err) {
//       toast.error("Reject action failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-['Plus_Jakarta_Sans']">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
//           <p className="text-xl font-bold tracking-tight">
//             Authenticating Admin Pro...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#020617] flex font-['Plus_Jakarta_Sans',sans-serif] text-slate-200">
//       {/* --- SIDEBAR START --- */}
//       <aside className="w-72 border-r border-slate-800/60 bg-[#020617]/50 backdrop-blur-xl p-6 flex flex-col sticky top-0 h-screen z-50">
//         <div className="flex items-center gap-3 px-2 mb-10">
//           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
//             <ShieldCheck className="w-6 h-6 text-white" />
//           </div>
//           <span className="text-xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
//             Admin<span className="text-indigo-500 font-black">PRO</span>
//           </span>
//         </div>

//         <nav className="space-y-1 flex-1">
//           <SidebarLink
//             icon={LayoutDashboard}
//             label="Overview"
//             active={activeTab === "overview"}
//             onClick={() => setActiveTab("overview")}
//           />
//           <SidebarLink
//             icon={Users}
//             label="Normal Users"
//             active={activeTab === "users"}
//             onClick={() => setActiveTab("users")}
//           />
//           <SidebarLink
//             icon={Wrench}
//             label="Service Providers"
//             active={activeTab === "providers"}
//             onClick={() => setActiveTab("providers")}
//           />
//           <SidebarLink
//             icon={PlusSquare}
//             label="Add Service"
//             active={activeTab === "add-service"}
//             onClick={() => setActiveTab("add-service")}
//           />

//           <SidebarLink
//             icon={CalendarDays}
//             label="All Bookings"
//             active={activeTab === "bookings"}
//             onClick={() => setActiveTab("bookings")}
//           />
//           <SidebarLink
//             icon={IndianRupee}
//             label="Revenue"
//             active={activeTab === "revenue"}
//             onClick={() => setActiveTab("revenue")}
//           />
//           <SidebarLink
//             icon={AlertTriangle}
//             label="Disputes"
//             count="2"
//             active={activeTab === "disputes"}
//             onClick={() => setActiveTab("disputes")}
//           />
//         </nav>

//         <div className="mt-auto border-t border-slate-800 pt-6">
//           <button
//             onClick={() => {
//               localStorage.clear();
//               navigate("/login");
//             }}
//             className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
//           >
//             <LogOut className="w-5 h-5" /> Logout System
//           </button>
//         </div>
//       </aside>
//       {/* --- SIDEBAR END --- */}

//       {/* --- MAIN CONTENT START --- */}
//       <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
//         {/* CONDITION 1: OVERVIEW TAB */}
//         {activeTab === "overview" && (
//           <div className="animate-in fade-in duration-500">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
//               <div>
//                 <h1 className="text-4xl font-extrabold text-white tracking-tighter">
//                   Command Center
//                 </h1>
//                 <p className="text-slate-400 mt-1.5 font-medium">
//                   Real-time monitoring of LocalServe ecosystem.
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//               <StatCard
//                 title="Total Users"
//                 value={stats.users}
//                 icon={Users}
//                 trend="+12%"
//               />
//               <StatCard
//                 title="Active Providers"
//                 value={stats.providers}
//                 icon={Wrench}
//                 trend="+5.2%"
//               />
//               <StatCard
//                 title="Pending Approvals"
//                 value={stats.pending}
//                 icon={ShieldCheck}
//                 color="text-yellow-400"
//               />
//               <StatCard
//                 title="Total Earnings"
//                 value={`₹${stats.revenue}`}
//                 icon={IndianRupee}
//                 color="text-emerald-400"
//               />
//             </div>

//             <div className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] overflow-hidden backdrop-blur-md shadow-xl">
//               <div className="px-8 py-7 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
//                 <h2 className="text-xl font-bold flex items-center gap-3 text-white">
//                   <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
//                   Pending Provider Approvals
//                 </h2>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="text-slate-500 text-[11px] uppercase tracking-[0.2em] border-b border-slate-800 font-bold">
//                       <th className="px-8 py-5">Provider Info</th>
//                       <th className="px-8 py-5">Service Type</th>
//                       <th className="px-8 py-5 text-center">
//                         Verification Docs
//                       </th>
//                       <th className="px-8 py-5 text-center">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-800/50">
//                     {pendingQueue.length > 0 ? (
//                       pendingQueue.map((provider) => (
//                         <ProviderRow
//                           key={provider.id}
//                           name={provider.name}
//                           email={provider.email}
//                           service={provider.category}
//                           docUrl={provider.aadhar_pdf_url}
//                           profilePic={provider.profile_pic_url}
//                           onApprove={() => handleApprove(provider.id)}
//                           onReject={() => handleReject(provider.id)}
//                         />
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="4"
//                           className="px-8 py-10 text-center text-slate-500 italic"
//                         >
//                           No pending approvals found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* CONDITION 2: NORMAL USERS */}
//         {activeTab === "users" && <UserList />}

//         {/* ✅ CONDITION 3: APPROVED PROVIDERS (Yahan koi fallback nahi aayega ab) */}
//         {activeTab === "providers" && <ApprovedProviders />}

//         {/* ✅ CONDITION 4: ADD SERVICE (Ise alag tab mein rakho) */}
//         {activeTab === "add-service" && (
//           <div className="flex flex-col gap-6 animate-in fade-in duration-500">
//             <h2 className="text-3xl font-black text-white tracking-tighter">
//               Service Management
//             </h2>
//             <AddService />
//           </div>
//         )}
//         {/* ✅ FIXED FALLBACK: Isme 'providers' ko bhi exclude karo */}
//         {activeTab !== "overview" &&
//           activeTab !== "users" &&
//           activeTab !== "providers" &&
//           activeTab !== "add-service" && (
//             <div className="flex items-center justify-center h-full">
//               <h2 className="text-2xl text-slate-500 font-medium">
//                 Section for{" "}
//                 <span className="text-indigo-500 font-black uppercase underline underline-offset-8 decoration-indigo-500/30 tracking-tight">
//                   {activeTab}
//                 </span>{" "}
//                 coming soon...
//               </h2>
//             </div>
//           )}
//       </main>
//       {/* --- MAIN CONTENT END --- */}
//     </div>
//   );
// }

// // --- REUSABLE SUB-COMPONENTS (SIDEBAR, STATS, ROWS) ---

// function SidebarLink({ icon: Icon, label, active, onClick, count }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
//         active
//           ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
//           : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
//       }`}
//     >
//       <div className="flex items-center gap-4 font-semibold text-sm tracking-tight">
//         <Icon
//           className={`w-5 h-5 ${active ? "animate-pulse" : "opacity-60 group-hover:opacity-100"}`}
//         />
//         {label}
//       </div>
//       {count && (
//         <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-lg text-white font-bold ring-2 ring-red-500/20">
//           {count}
//         </span>
//       )}
//     </button>
//   );
// }

// function StatCard({ title, value, icon: Icon, trend, color = "text-white" }) {
//   return (
//     <div className="bg-slate-900/40 border border-slate-800/60 p-7 rounded-[28px] hover:border-slate-700 transition-all group shadow-sm hover:shadow-indigo-500/5">
//       <div className="flex justify-between items-start mb-5">
//         <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
//           <Icon className="w-6 h-6 text-indigo-400" />
//         </div>
//         {trend && (
//           <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1.5 rounded-xl">
//             {trend} ↗
//           </span>
//         )}
//       </div>
//       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
//         {title}
//       </p>
//       <h3 className={`text-3xl font-black mt-1.5 ${color}`}>{value}</h3>
//     </div>
//   );
// }

// function ProviderRow({
//   name,
//   email,
//   service,
//   docUrl,
//   profilePic,
//   onApprove,
//   onReject,
// }) {
//   const backendBaseUrl = "http://localhost:5000";
//   const imagePath = profilePic ? profilePic.replace(/\\/g, "/") : null;
//   const fullImageUrl = imagePath ? `${backendBaseUrl}/${imagePath}` : null;

//   return (
//     <tr className="hover:bg-slate-800/20 transition-colors group">
//       <td className="px-8 py-6">
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             {fullImageUrl ? (
//               <img
//                 src={fullImageUrl}
//                 alt={name}
//                 className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 hover:border-indigo-500 transition-all cursor-pointer shadow-md"
//                 onClick={() => window.open(fullImageUrl, "_blank")}
//                 onError={(e) => {
//                   e.target.src = "https://ui-avatars.com/api/?name=" + name;
//                 }}
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700 uppercase">
//                 {name[0]}
//               </div>
//             )}
//           </div>
//           <div>
//             <p className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
//               {name}
//             </p>
//             <p className="text-xs text-slate-500 font-medium">{email}</p>
//           </div>
//         </div>
//       </td>

//       <td className="px-8 py-6 text-sm font-medium text-slate-300">
//         <span className="px-3.5 py-1.5 bg-slate-800 rounded-full border border-slate-700 text-[10px] uppercase font-bold tracking-tight">
//           {service}
//         </span>
//       </td>

//       <td className="px-8 py-6">
//         <div className="flex justify-center">
//           {docUrl ? (
//             <a
//               href={`${backendBaseUrl}/${docUrl}`}
//               target="_blank"
//               rel="noreferrer"
//               className="text-indigo-400 text-[10px] font-black hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all hover:scale-105"
//             >
//               <FileText className="w-3.5 h-3.5" /> VIEW PDF
//             </a>
//           ) : (
//             <span className="text-slate-600 text-[10px] italic font-bold">
//               MISSING DOCS
//             </span>
//           )}
//         </div>
//       </td>

//       <td className="px-8 py-6">
//         <div className="flex justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
//           <button
//             onClick={onApprove}
//             className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
//           >
//             <CheckCircle className="w-4 h-4" /> APPROVE
//           </button>
//           <button
//             onClick={onReject}
//             className="px-5 py-2.5 border border-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 active:scale-95"
//           >
//             <XCircle className="w-4 h-4" /> REJECT
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// }
