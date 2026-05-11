import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, History, Star, Settings, LogOut,
  Search, Bell, MapPin, Loader2, Sparkles, Menu, X,
  MessageSquare, Heart, CreditCard, UserPlus, Zap, Gift,
  CheckCircle2, Clock, Calendar, ShieldCheck, ArrowRight
} from 'lucide-react';
import UserBookings from './UserBookings';
import UserMessages from './UserMessages';
import UserPayments from './UserPayments';
import { API_BASE_URL } from '../../config/api';
import { io } from 'socket.io-client';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('discovery');
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarTabs = [
    { id: 'discovery', label: 'Discovery', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: History },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'account', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const [userRes, serviceRes, bookingsRes, chatRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/admin/get-services`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/bookings/my-bookings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/chat/unread-counts`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const uData = await userRes.json();
        const sData = await serviceRes.json();
        const bData = await bookingsRes.json();
        const cData = await chatRes.json();

        if (uData.success) setUserData(uData.user);
        if (sData.success) setServices(sData.services);

        if (Array.isArray(bData)) setBookings(bData);
        else if (bData.success && Array.isArray(bData.bookings)) setBookings(bData.bookings);

        if (cData.success && cData.counts) {
          const total = Object.values(cData.counts).reduce((a, b) => a + b, 0);
          setUnreadCount(total);
        }
      } catch (err) {
        console.error("Data fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("chat_unread", () => {
      setUnreadCount(prev => prev + 1);
    });

    socket.on("chat_read", () => {
      fetch(`${API_BASE_URL}/api/chat/unread-counts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.counts) {
            setUnreadCount(Object.values(data.counts).reduce((a, b) => a + b, 0));
          }
        });
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 font-sans">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#0f172a]/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-0.5 cursor-pointer group"
          >
            <img
              src="/images/logo3.png"
              alt="LocalServe logo"
              className="w-16 h-16 object-contain drop-shadow-[0_0_24px_rgba(6,182,212,0.4)] group-hover:drop-shadow-[0_0_32px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-all duration-300"
            />
            <span className="-ml-1 text-2xl font-extrabold text-white tracking-tight">
              Local<span className="text-indigo-400">Serve</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
                {active && <motion.div layoutId="activeTabIndicator" className="absolute left-0 h-6 w-1 rounded-r-full bg-indigo-500" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Card */}
        <div className="p-4 space-y-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN COLUMN --- */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4 sm:px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-sm font-medium text-slate-400">Hi, {userData?.name?.split(' ')[0] || 'Bittu'} 👋</h2>
                <div className="flex items-center gap-1 text-xs text-indigo-400 mt-0.5">
                  <MapPin size={12} className="text-emerald-400" />
                  <span className="font-medium">{userData?.city || 'Rajpura'}, {userData?.state || 'Punjab'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 transition">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#020617]" />
                )}
              </button>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0f172a] text-sm font-bold text-white shadow-inner">
                  {userData?.name?.charAt(0) || 'B'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'discovery' && (
              <motion.div key="discovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DiscoveryPanel services={services} userData={userData} navigate={navigate} bookings={bookings} />
              </motion.div>
            )}
            {activeTab === 'bookings' && <UserBookings />}
            {activeTab === 'account' && <AccountPanel userData={userData} setUserData={setUserData} />}
            {activeTab === 'messages' && <UserMessages />}
            {activeTab === 'payments' && <UserPayments />}
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

/* ── DISCOVERY PANEL ─────────────────────────────────────────── */

/* ── DISCOVERY PANEL ─────────────────────────────────────────── */

function DiscoveryPanel({ services, userData, navigate, bookings = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const openProviders = (serviceName) => {
    const city = userData?.city?.trim() || 'Rajpura';
    navigate(`/services/${encodeURIComponent(serviceName.toLowerCase())}?city=${encodeURIComponent(city)}`);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(dateStr);
    bDate.setHours(0, 0, 0, 0);
    return bDate >= today;
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    openProviders(searchQuery.trim());
  };

  const handleEmergencyClick = () => {
    let selectedValue = '';
    Swal.fire({
      title: '<span class="text-white font-black text-2xl tracking-tight">🚨 Emergency Service Required?</span>',
      html: `
        <p class="text-slate-400 text-sm mb-6 font-medium">Select the professional you need right now.</p>
        <div class="relative w-full text-left" id="custom-dropdown-container">
          <button id="custom-dropdown-btn" class="w-full bg-[#1e293b] text-[#f8fafc] border border-slate-600/50 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/80 font-medium flex justify-between items-center transition-all shadow-lg hover:border-slate-500/80 hover:bg-[#1e293b]/80">
            <span id="custom-dropdown-text" class="text-slate-300">Select your emergency type</span>
            <svg class="fill-current h-5 w-5 transition-transform duration-300 text-slate-400" id="custom-dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </button>
          
          <div id="custom-dropdown-menu" class="absolute z-[100] w-full mt-2 bg-[#0f172a] border border-slate-700/50 rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] opacity-0 invisible transform -translate-y-2 transition-all duration-300 overflow-hidden">
            <div class="max-h-56 overflow-y-auto custom-swal-scrollbar">
              <div class="custom-option px-5 py-3 hover:bg-indigo-600 cursor-pointer transition-colors border-b border-white/5 group" data-value="Plumber">
                <span class="font-bold text-[#f1f5f9] group-hover:text-white block">Plumber</span>
                <span class="text-xs text-slate-400 group-hover:text-indigo-100 block mt-0.5">Burst Pipe / Severe Leak</span>
              </div>
              <div class="custom-option px-5 py-3 hover:bg-indigo-600 cursor-pointer transition-colors border-b border-white/5 group" data-value="Electrician">
                <span class="font-bold text-[#f1f5f9] group-hover:text-white block">Electrician</span>
                <span class="text-xs text-slate-400 group-hover:text-indigo-100 block mt-0.5">Power Outage / Short Circuit</span>
              </div>
              <div class="custom-option px-5 py-3 hover:bg-indigo-600 cursor-pointer transition-colors border-b border-white/5 group" data-value="AC Repair">
                <span class="font-bold text-[#f1f5f9] group-hover:text-white block">AC Repair</span>
                <span class="text-xs text-slate-400 group-hover:text-indigo-100 block mt-0.5">AC Breakdown</span>
              </div>
              <div class="custom-option px-5 py-3 hover:bg-indigo-600 cursor-pointer transition-colors group" data-value="Cleaning">
                <span class="font-bold text-[#f1f5f9] group-hover:text-white block">Cleaning</span>
                <span class="text-xs text-slate-400 group-hover:text-indigo-100 block mt-0.5">Urgent Cleaning Needed</span>
              </div>
            </div>
          </div>
        </div>
        <style>
          .custom-swal-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-swal-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-swal-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; border: 2px solid #0f172a; }
          .custom-swal-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
          .swal2-html-container { overflow: visible !important; }
        </style>
      `,
      showCancelButton: true,
      confirmButtonColor: '#ec1212',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Find Expert Now',
      background: '#0f172a',
      customClass: {
        popup: 'rounded-[2rem] border border-red-500/20 !overflow-visible',
      },
      didOpen: () => {
        const btn = document.getElementById('custom-dropdown-btn');
        const menu = document.getElementById('custom-dropdown-menu');
        const text = document.getElementById('custom-dropdown-text');
        const arrow = document.getElementById('custom-dropdown-arrow');
        const options = document.querySelectorAll('.custom-option');

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          menu.classList.toggle('opacity-0');
          menu.classList.toggle('invisible');
          menu.classList.toggle('-translate-y-2');
          arrow.classList.toggle('rotate-180');
        });

        options.forEach(opt => {
          opt.addEventListener('click', () => {
            selectedValue = opt.getAttribute('data-value');
            text.textContent = opt.querySelector('span.font-bold').textContent;
            text.classList.replace('text-slate-300', 'text-[#f1f5f9]');
            menu.classList.add('opacity-0', 'invisible', '-translate-y-2');
            arrow.classList.remove('rotate-180');

            // Highlight selected
            options.forEach(o => o.classList.remove('bg-indigo-500/20'));
            opt.classList.add('bg-indigo-500/20');
          });
        });
      },
      preConfirm: () => {
        if (!selectedValue) {
          Swal.showValidationMessage('Please select an emergency type');
          return false;
        }
        return selectedValue;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        openProviders(result.value);
      }
    });
  };

  const handleInviteClick = () => {
    const inviteLink = `${window.location.origin}/register?ref=${userData?.id || 'LOCALSERVE'}`;
    navigator.clipboard.writeText(inviteLink);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Invite link copied to your clipboard.',
      background: '#1b2233ff',
      color: '#f1f5f9',
      iconColor: '#10b981',
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter((b) => isUpcoming(b.bookingDate) && b.status !== 'completed' && b.status !== 'rejected' && b.status !== 'cancelled').length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'Paid' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.provider?.pricePerHour || 0), 0)
    .toLocaleString('en-IN');

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] p-8 md:p-14 border border-white/5"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden lg:block">
          <Zap size={240} className="text-indigo-500 rotate-12" strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 border border-indigo-500/20 mb-8"
          >
            <ShieldCheck size={14} /> 100% Verified Local Experts
          </motion.span>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            Find trusted experts,<br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              book in minutes
            </span>
          </h1>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            Professional services for your home and office in {userData?.city || 'Rajpura'}.
            Quality work guaranteed at transparent prices.
          </p>

          {/* Search Bar */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
              <input
                type="text"
                placeholder="What do you need help with?"
                className="w-full rounded-2xl bg-white/5 border border-white/10 py-5 pl-14 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              {/* Dynamic Search Dropdown */}
              <AnimatePresence>
                {searchQuery.trim() && filteredServices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    {filteredServices.slice(0, 5).map(s => (
                      <button
                        key={s.id || s.name}
                        onClick={() => openProviders(s.name)}
                        className="w-full text-left px-5 py-4 hover:bg-white/5 text-slate-300 hover:text-white transition flex items-center gap-4 border-b border-white/5 last:border-0"
                      >
                        <span className="text-2xl">{s.icon || '🛠️'}</span>
                        <span className="font-medium">{s.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleSearchSubmit}
              className="rounded-2xl bg-indigo-600 px-10 py-5 font-bold text-white shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 flex items-center justify-center gap-2"
            >
              Search <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {['Plumber', 'Electrician', 'AC Repair', 'Cleaning'].map(chip => (
              <button
                key={chip}
                onClick={() => openProviders(chip)}
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', val: totalBookings.toString().padStart(2, '0'), icon: History, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Upcoming', val: upcomingBookings.toString().padStart(2, '0'), icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Completed', val: completedBookings.toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Spent', val: `₹${totalSpent}`, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="group rounded-[2.5rem] bg-[#0f172a]/40 p-8 border border-white/5 hover:border-white/10 transition-all shadow-sm"
          >
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter">{stat.val}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Services Grid */}
      <section>
        <div className="flex items-end justify-between mb-8 px-2">
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Popular Services</h3>
            <p className="text-slate-500 mt-2 font-medium">Select a category to find the best experts near you</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition">
            Browse All <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {filteredServices.slice(0, 6).map((service, idx) => (
            <motion.button
              whileHover={{ y: -10 }}
              key={idx}
              onClick={() => openProviders(service.name)}
              className="group relative flex flex-col items-center rounded-[2.5rem] bg-[#0f172a]/40 p-8 border border-white/5 hover:border-indigo-500/50 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.2)] transition-all duration-300"
            >
              <div className="mb-6 h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500 shadow-inner">
                {service.icon || '🛠️'}
              </div>
              <p className="font-bold text-slate-200 group-hover:text-white transition text-center">{service.name}</p>
              <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                Book Now
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* High-Impact Cards */}
      <div className="w-full mt-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="w-full rounded-[3rem] bg-gradient-to-r from-red-600/10 via-red-600/20 to-orange-600/10 p-10 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition duration-700">
            <Zap size={200} fill="currentColor" className="text-red-500" />
          </div>
          <div className="text-center md:text-left relative z-10">
            <h3 className="text-3xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
              Emergency Help <span className="animate-pulse">🚨</span>
            </h3>
            <p className="text-red-200/60 mt-3 text-lg max-w-md font-medium">
              Critical issue? Get a professional at your door in under <span className="text-white">30 minutes</span>.
            </p>
          </div>
          <button
            onClick={handleEmergencyClick}
            className="relative z-10 w-full md:w-auto rounded-2xl bg-red-600 px-10 py-5 font-black text-white shadow-2xl shadow-red-600/30 hover:bg-red-500 transition active:scale-95 uppercase tracking-widest text-sm"
          >
            Request Now
          </button>
        </motion.div>
      </div>

      {/* Simplified How It Works */}
      <section className="pt-12 border-t border-white/5">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-4">Our Process</p>
          <h3 className="text-4xl font-bold text-white tracking-tight">How LocalServe works</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { id: '01', t: 'Select Service', d: 'Choose from our wide range of expert categories.', i: LayoutDashboard },
            { id: '02', t: 'Pick Your Expert', d: 'View ratings, distances, and prices to find your match.', i: Star },
            { id: '03', t: 'Confirm & Relax', d: 'Book your slot and track the expert in real-time.', i: Clock },
          ].map((step, i) => (
            <div key={i} className="text-center group">
              <div className="mx-auto mb-8 h-20 w-20 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 transition-all duration-500 group-hover:bg-indigo-500 group-hover:text-white shadow-inner group-hover:shadow-indigo-500/50">
                <step.i size={32} />
              </div>
              <h4 className="text-white font-bold text-xl mb-3 tracking-tight">{step.t}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── ACCOUNT SETTINGS PANEL ─────────────────────────────────── */

function AccountPanel({ userData, setUserData }) {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    city: userData?.city || '',
    state: userData?.state || '',
  });
  const [saving, setSaving] = useState(false);

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
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          background: '#0f172a',
          color: '#f1f5f9',
          iconColor: '#6366f1',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Settings size={28} />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Account Settings</h2>
      </div>

      <form onSubmit={handleSave} className="rounded-[3rem] bg-[#0f172a]/40 p-10 border border-white/5 space-y-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email Address', key: 'email', type: 'email' },
            { label: 'Current City', key: 'city', type: 'text' },
            { label: 'State / Region', key: 'state', type: 'text' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{f.label}</label>
              <input
                type={f.type}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition font-medium"
                value={formData[f.key]}
                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                required
              />
            </div>
          ))}
        </div>
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-12 py-4 bg-indigo-600 rounded-2xl font-black text-white hover:bg-indigo-500 transition shadow-2xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {saving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* ── HELPERS / SCREENS ─────────────────────────────────────── */

function ComingSoon({ activeTab }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="mb-8 h-28 w-28 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner"
      >
        <Sparkles size={48} />
      </motion.div>
      <h2 className="text-3xl font-bold text-white capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
      <p className="text-slate-500 mt-3 max-w-sm font-medium leading-relaxed">
        This premium module is under construction. We're building something amazing for your dashboard.
      </p>
      <button className="mt-10 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">
        Get Notified
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#020617] gap-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="p-[3px] rounded-[2rem] bg-gradient-to-tr from-indigo-500 via-blue-500 to-emerald-500"
      >
        <div className="bg-[#020617] p-6 rounded-[calc(2rem-3px)]">
          <Loader2 className="text-indigo-400 animate-spin" size={40} strokeWidth={1.5} />
        </div>
      </motion.div>
      <div className="text-center">
        <p className="text-slate-400 font-black tracking-[0.5em] uppercase text-[10px]">Initialising</p>
        <p className="text-slate-600 text-xs font-bold mt-2">LocalServe Workspace 3.0</p>
      </div>
    </div>
  );
}