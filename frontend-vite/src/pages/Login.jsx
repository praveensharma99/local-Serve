import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { Mail, Lock, Shield, KeyRound, Fingerprint } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw?.slice(0, 200) || `Login failed (${response.status})` };
      }

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const role = String(data.user.role || '').toLowerCase().trim();
        localStorage.setItem('role', role);
        toast.success(`Welcome back, ${data.user.name}! 🚀`);
        setTimeout(() => {
          if (role === 'admin') navigate('/admin');
          else if (role === 'provider') {
            if (data.user.needsOnboarding) navigate('/provider/onboarding');
            else navigate('/provider');
          } else navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (err) {
      toast.error('Unable to connect to the server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#030B1D] font-['Inter',sans-serif]">
      <div className="relative flex h-screen w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_82%_48%,rgba(99,102,241,0.16),transparent_48%)]" />

        <section className="relative hidden h-full w-1/2 items-center justify-center lg:flex">
          <div className="absolute left-12 top-10 flex items-center gap-3">
            <img src="/images/logo3.png" alt="LocalServe logo" className="h-16 w-16 object-contain" />
            <h1 className="text-[30px] font-bold tracking-tight text-white">
              Local<span className="text-indigo-400">Serve</span>
            </h1>
          </div>

          {/* ORBIT SYSTEM CONTAINER */}
          <div className="relative flex h-[450px] w-[450px] items-center justify-center">
            
            {/* Visual Background Orbits */}
            <div className="absolute h-full w-full rounded-full border border-blue-500/10 shadow-[inset_0_0_50px_rgba(59,130,246,0.05)]" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-indigo-500/10" />
            
            {/* Center Image - Resized for balance */}
            <div className="relative z-20 h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-[#1e293b] shadow-[0_0_50px_rgba(59,130,246,0.4)]">
              <img
                src="/images/login.png"
                alt="Login security illustration"
                className="h-full w-full object-cover scale-110"
              />
            </div>

            {/* ROTATING ORBIT LAYER */}
            <div className="absolute inset-0 z-30 animate-[spin_20s_linear_infinite]">
              
              {/* TOP: Cyan Lock */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_20s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-[#0c1430] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]">
                  <Lock size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* RIGHT: Electric Blue Shield */}
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_20s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-500 bg-[#0c1430] text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.7)]">
                  <Shield size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* BOTTOM: Neon Purple Key */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="animate-[spin_20s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500 bg-[#0c1430] text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                  <KeyRound size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* LEFT: Hot Pink Fingerprint */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_20s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-pink-500 bg-[#0c1430] text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.7)]">
                  <Fingerprint size={32} strokeWidth={2.5} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Form Section remains the same functional-wise with matching UI */}
        <section className="relative flex h-full w-full items-center justify-center px-5 lg:w-1/2">
          <div className="w-full max-w-[500px] rounded-[32px] border border-white/10 bg-[#0C1430]/80 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
                <img src="/images/logo3.png" alt="LocalServe logo" className="h-12 w-12 object-contain" />
                <p className="text-xl font-bold text-white">Local<span className="text-indigo-400">Serve</span></p>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
              <p className="mt-2 text-slate-400">Securely sign in to your LocalServe account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50">
                  <Mail size={18} className="text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    className="h-full w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <button type="button" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Forgot?</button>
                </div>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50">
                  <Lock size={18} className="text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    className="h-full w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              New here? <button onClick={() => navigate('/register')} className="font-bold text-indigo-400 hover:text-indigo-300">Join LocalServe</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
