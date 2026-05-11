import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { Mail, Lock, Shield, KeyRound, Fingerprint, Eye, EyeOff } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import AuthBranding from '../components/AuthBranding';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) errorMsg = 'Please enter a valid email address';
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const isFormValid = formData.email && formData.password && !errors.email;

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
    <div className="h-screen w-full overflow-hidden bg-[#030B1D] font-['Inter',sans-serif] relative">
      <ParticleBackground />
      <AuthBranding />
      <div className="relative flex h-screen w-full z-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_82%_48%,rgba(99,102,241,0.16),transparent_48%)]" />

        <section className="relative hidden h-full w-1/2 items-center justify-center lg:flex">

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
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
              <p className="mt-2 text-slate-400">Securely sign in to your LocalServe account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
                <div className={`flex h-12 items-center gap-3 rounded-xl border bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50 ${errors.email ? 'border-red-500/80' : 'border-white/10'}`}>
                  <Mail size={18} className={errors.email ? "text-red-400" : "text-slate-500"} />
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
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <button type="button" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Forgot?</button>
                </div>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50">
                  <Lock size={18} className="text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="h-full w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
