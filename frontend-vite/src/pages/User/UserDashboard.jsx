import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, History, Star, Settings, LogOut,
  Search, Bell, MapPin, Loader2, ChevronRight, Sparkles,
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
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#0a0b1a] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0e20] p-5">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/30 text-lg font-black">
            L
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-white">
              Local<span className="text-violet-400">Serve</span>
            </p>
            <p className="text-xs text-slate-500">Find local experts</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/30'
                    : 'text-slate-400 hover:bg-violet-500/10 hover:text-white'
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
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-400/20 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* TOPBAR */}
        <div className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0a0b1a]/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-8 py-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400">
                <Sparkles className="h-3.5 w-3.5" /> User Workspace
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">
                {activeTab === 'discovery' ? `Hii, ${userData?.name?.split(' ')[0]}! 👋` : sidebarTabs.find((t) => t.id === activeTab)?.label}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Location */}
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12142a] px-4 py-2.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-300">{userData?.city || 'India'}</span>
              </div>

              {/* Bell */}
              <button className="relative rounded-xl border border-white/[0.08] bg-[#12142a] p-2.5 text-slate-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-500"></span>
              </button>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 text-sm font-black text-white shadow-lg shadow-violet-500/30">
                {userData?.name?.charAt(0)}
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-4 lg:hidden">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-[#12142a] text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'discovery' && <DiscoveryPanel services={services} 
    userData={userData} 
    navigate={navigate} />}
          {activeTab === 'bookings' && <UserBookings />}
          {activeTab === 'account' && <AccountPanel userData={userData} setUserData={setUserData} />}
          {activeTab !== 'discovery' && activeTab !== 'bookings' && activeTab !== 'account' && <ComingSoon activeTab={activeTab} />}
        </div>

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
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-[#12142a] to-emerald-600/10 border border-white/[0.08] p-8 sm:p-12">
        <div className="absolute top-6 right-8 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl animate-pulse" />
        <div className="absolute bottom-6 left-8 h-16 w-16 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-3 animate-fadeIn">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Hi, {userData?.name?.split(' ')[0]}! <span className="text-violet-400">Ready to book?</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Find trusted local experts for any service you need. From plumbing to tutoring, we've got you covered.
          </p>

          <div className="relative max-w-md animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What service do you need today?"
              className="w-full rounded-2xl border border-white/[0.12] bg-[#0a0b1a]/80 backdrop-blur-sm py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/60 transition-all shadow-lg"
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
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "bg-[#12142a] text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/20"
              }`}
            >
              {cat === "all" ? "All Services" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <section className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Browse</p>
            <h3 className="text-xl font-black text-white">Popular Services</h3>
            <p className="text-xs text-slate-500 mt-1">Choose a service and find the best experts near you</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            {filteredServices.length} available
          </span>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredServices.map((service, idx) => (
              <button
                key={service.id}
                onClick={() => openProviders(service.name)}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#12142a] p-5 text-center transition-all hover:border-violet-500/40 hover:bg-[#15172f] hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5"
                style={{ animationDelay: `${0.6 + idx * 0.05}s` }}
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all group-hover:border-violet-500/30 group-hover:bg-violet-500/10 group-hover:scale-110">
                  <span className="text-2xl transition-transform group-hover:scale-110">{service.icon || '🛠️'}</span>
                </div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{service.name}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-violet-400 transition-colors">
                  Book Now
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#12142a] py-16 text-center">
            <p className="text-sm text-slate-500 font-medium">No services found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-3 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-3xl border border-white/[0.06] bg-[#12142a] p-8 sm:p-10 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">How it works</p>
          <h3 className="text-xl font-black text-white">Book in 3 simple steps</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Choose Service", desc: "Browse and select the service you need" },
            { step: "02", title: "Pick Expert", desc: "Compare profiles and select the best provider" },
            { step: "03", title: "Confirm Booking", desc: "Set date & time and confirm your appointment" },
          ].map((item) => (
            <div key={item.step} className="text-center p-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-all">
              <p className="text-2xl font-black text-violet-500/30 mb-2">{item.step}</p>
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
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
    <div className="animate-fadeIn">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">Settings</p>
        <h2 className="text-2xl font-black text-white">Edit Profile</h2>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl rounded-2xl border border-white/[0.08] bg-[#12142a] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full sm:w-auto px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

/* ── MISC ────────────────────────────────────────────────────── */

function ComingSoon({ activeTab }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-dashed border-violet-500/20 bg-[#12142a] p-6 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-400">Coming Soon</p>
        <h2 className="mt-3 text-2xl font-black capitalize text-white">{activeTab.replace('-', ' ')}</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">This section will be available soon.</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#0a0b1a]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
        <Loader2 className="animate-spin text-white" size={22} />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading your dashboard</p>
    </div>
  );
}
