import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, History, Star, Settings, LogOut,
  Search, Bell, MapPin, Loader2, Sparkles, Menu, X,
} from 'lucide-react';
import UserBookings from './UserBookings';
import { API_BASE_URL } from '../../config/api';

const sidebarTabs = [
  { id: 'discovery', label: 'Discovery', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Bookings', icon: History },
  { id: 'top-rated', label: 'Top Rated', icon: Star },
  { id: 'account', label: 'Account', icon: Settings },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('discovery');
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const selectTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, serviceRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/admin/get-services`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const userData = await userRes.json();
        const serviceData = await serviceRes.json();
        if (userData.success) setUserData(userData.user);
        if (serviceData.success) setServices(serviceData.services);
      } catch (err) {
        console.error("Data fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile / small tablet: dim overlay when drawer open */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Fixed sidebar: drawer below lg, fixed strip lg+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-900 transition-transform duration-200 ease-out lg:z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Brand — homepage logo */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-4">
            <button
              type="button"
              onClick={() => navigate('/')}
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
                <p className="text-xs text-slate-500">Find local experts</p>
              </div>
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Dashboard sections">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  <span>{tab.label}</span>
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

      {/* Main column — offset for fixed sidebar on lg+ */}
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
                onClick={() => navigate('/')}
                className="flex shrink-0 items-center rounded-lg py-1 outline-none ring-indigo-500/40 transition hover:bg-slate-900/80 focus-visible:ring-2 lg:hidden"
                aria-label="Home"
              >
                <img src="/images/logo3.png" alt="" className="h-8 w-8 object-contain" />
              </button>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">Workspace</span>
                </p>
                <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {activeTab === 'discovery'
                    ? `Hi, ${userData?.name?.split(' ')[0] || 'there'}`
                    : sidebarTabs.find((t) => t.id === activeTab)?.label}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 sm:flex">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="max-w-[120px] truncate text-xs font-medium text-slate-300 md:max-w-[160px]">
                  {userData?.city || 'India'}
                </span>
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
                {userData?.name?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'discovery' && (
            <DiscoveryPanel services={services} userData={userData} navigate={navigate} />
          )}
          {activeTab === 'bookings' && <UserBookings />}
          {activeTab === 'account' && <AccountPanel userData={userData} setUserData={setUserData} />}
          {activeTab !== 'discovery' && activeTab !== 'bookings' && activeTab !== 'account' && (
            <ComingSoon activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── DISCOVERY PANEL ─────────────────────────────────────────── */

function DiscoveryPanel({ services, userData, navigate }) {
  const userCity = userData?.city?.trim();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const openProviders = (serviceName) => {
    if (!userCity) {
      alert('Please add your city to find nearby providers.');
      return;
    }
    navigate(`/services/${encodeURIComponent(serviceName.toLowerCase())}?city=${encodeURIComponent(userCity)}`);
  };

  const categories = ["all", ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter(s => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (s.name || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:rounded-3xl sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90 animate-fadeIn">
            Welcome back
          </p>
          <h1 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Hi, {userData?.name?.split(' ')[0]}
            <span className="text-slate-400"> — </span>
            <span className="text-indigo-400">ready to book?</span>
          </h1>
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-slate-400 sm:mb-8 sm:text-base animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Find trusted local experts for any service you need. From plumbing to tutoring, we&apos;ve got you covered.
          </p>

          <div className="relative max-w-md animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What service do you need today?"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3.5 pl-11 pr-4 text-sm text-white shadow-sm outline-none ring-indigo-500/30 placeholder:text-slate-500 transition focus:border-indigo-500/50 focus:ring-2 sm:rounded-2xl sm:py-4"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-slate-700/80 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {cat === "all" ? "All Services" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <section className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">Browse</p>
            <h3 className="text-lg font-semibold text-white sm:text-xl">Popular services</h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Choose a service and find experts near you</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {filteredServices.length} available
          </span>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredServices.map((service, idx) => (
              <button
                key={service.id}
                type="button"
                onClick={() => openProviders(service.name)}
                className="group rounded-xl border border-slate-800/80 bg-slate-900 p-4 text-center transition-all hover:border-indigo-500/40 hover:bg-slate-800/80 sm:rounded-2xl sm:p-5"
                style={{ animationDelay: `${0.6 + idx * 0.05}s` }}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/50 transition-colors group-hover:border-indigo-500/30 sm:h-14 sm:w-14 sm:rounded-xl">
                  <span className="text-xl sm:text-2xl">{service.icon || '🛠️'}</span>
                </div>
                <p className="text-xs font-medium text-slate-200 group-hover:text-white sm:text-sm">{service.name}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 group-hover:text-indigo-400">
                  Book now
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/50 py-12 text-center sm:py-16">
            <p className="text-sm font-medium text-slate-500">No services found matching your search.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:rounded-3xl sm:p-10 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
        <div className="mb-6 text-center sm:mb-8">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">How it works</p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">Book in three steps</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            { step: "01", title: "Choose service", desc: "Browse and select the service you need" },
            { step: "02", title: "Pick expert", desc: "Compare profiles and select the best provider" },
            { step: "03", title: "Confirm booking", desc: "Set date and time and confirm your appointment" },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-5 text-center transition-colors hover:border-slate-700 sm:rounded-2xl">
              <p className="mb-2 text-lg font-semibold tabular-nums text-indigo-500/40">{item.step}</p>
              <h4 className="mb-1 text-sm font-medium text-white">{item.title}</h4>
              <p className="text-xs leading-relaxed text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

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

/* ── ACCOUNT PANEL ───────────────────────────────────────────── */

function AccountPanel({ userData, setUserData }) {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    city: userData?.city || '',
    state: userData?.state || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      city: userData?.city || '',
      state: userData?.state || '',
    });
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
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
    <div className="animate-fadeIn mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">Settings</p>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Edit profile</h2>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

/* ── MISC ────────────────────────────────────────────────────── */

function ComingSoon({ activeTab }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30 p-8 text-center sm:min-h-[55vh]">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-400/90">Coming soon</p>
        <h2 className="mt-2 text-xl font-semibold capitalize text-white sm:text-2xl">{activeTab.replace('-', ' ')}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">This section will be available soon.</p>
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
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Loading your dashboard</p>
    </div>
  );
}
