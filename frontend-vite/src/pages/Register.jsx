import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { User, UserPlus, Mail, Check, Eye, EyeOff } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import AuthBranding from '../components/AuthBranding';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (name === 'name') {
      const nameRegex = /^[A-Za-z\s]{3,}$/;
      if (value && !nameRegex.test(value)) errorMsg = 'Only alphabets allowed, min 3 characters.';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) errorMsg = 'Please enter a valid email address.';
    } else if (name === 'password') {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (value && !passRegex.test(value)) {
        errorMsg = 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.';
      }
      // Re-validate confirmPassword if password changes
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match!' }));
      } else if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    } else if (name === 'confirmPassword') {
      if (value && value !== formData.password) errorMsg = 'Passwords do not match!';
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const isFormValid = 
    !errors.name && !errors.email && !errors.password && !errors.confirmPassword &&
    formData.name && formData.email && formData.password && formData.confirmPassword &&
    formData.city && formData.state;

  const handleVerify = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first!");
      return;
    }
    if (!formData.name) {
      toast.error("Please enter your name first!");
      return;
    }
    setLoading(true);
    const email = formData.email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name.trim(), email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP sent to your email! Check inbox.");
        setOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Server connection error!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!otpSent) {
      toast.error("Please verify your email first!");
      return;
    }
    if (!otp) {
      toast.error("Please enter the OTP!");
      return;
    }

    setLoading(true);
    const email = formData.email.trim().toLowerCase();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email,
          password: formData.password,
          role: formData.role,
          city: formData.city.trim(),
          state: formData.state.trim(),
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account Created! 🚀");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const role = String(data.user.role || "").toLowerCase().trim();
        localStorage.setItem("role", role);
        setTimeout(() => {
          if (role === "provider" && data.user.needsOnboarding) {
            navigate("/provider/onboarding");
          } else if (role === "provider") {
            navigate("/provider");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Server connection error!");
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

        {/* LEFT SECTION: PREMIMUM ORBIT UI */}
        <section className="relative hidden h-full w-1/2 items-center justify-center lg:flex">
          <div className="relative flex h-[450px] w-[450px] items-center justify-center">
            {/* Visual Background Orbits */}
            <div className="absolute h-full w-full rounded-full border border-blue-500/10 shadow-[inset_0_0_50px_rgba(59,130,246,0.05)]" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-indigo-500/10" />
            
            {/* Center Image */}
            <div className="relative z-20 h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-[#1e293b] shadow-[0_0_50px_rgba(59,130,246,0.4)]">
              <img
                src="/images/signup.png"
                alt="Signup illustration"
                className="h-full w-full object-cover scale-110"
              />
            </div>

            {/* ROTATING ORBIT LAYER */}
            <div className="absolute inset-0 z-30 animate-[spin_25s_linear_infinite]">
              
              {/* TOP: Cyan User */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_25s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-[#0c1430] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]">
                  <User size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* RIGHT: Electric Blue UserPlus */}
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_25s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-500 bg-[#0c1430] text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.7)]">
                  <UserPlus size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* BOTTOM: Neon Purple Mail */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="animate-[spin_25s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500 bg-[#0c1430] text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                  <Mail size={32} strokeWidth={2.5} />
                </div>
              </div>

              {/* LEFT: Sky Blue Check */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="animate-[spin_25s_linear_infinite_reverse] flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-sky-400 bg-[#0c1430] text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.7)]">
                  <Check size={32} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SECTION: REGISTER FORM */}
        <section className="relative flex h-full w-full items-center justify-center px-5 lg:w-1/2 overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-[620px] rounded-[32px] border border-white/10 bg-[#0C1430]/88 p-8 shadow-[0_25px_70px_rgba(30,41,96,0.45)] backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-[32px] font-bold tracking-tight text-white">Create Account</h2>
              <p className="text-slate-400 mt-1">Join the community of LocalServe</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "user" })}
                    className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                      formData.role === "user"
                        ? "border-blue-500 bg-blue-500/20 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "border-white/10 bg-[#101A36] text-slate-400 hover:border-white/20"
                    }`}
                  >
                    Find Services
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "provider" })}
                    className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                      formData.role === "provider"
                        ? "border-blue-500 bg-blue-500/20 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "border-white/10 bg-[#101A36] text-slate-400 hover:border-white/20"
                    }`}
                  >
                    Provide Service
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`h-12 w-full rounded-xl border bg-[#070d1f] px-4 text-white outline-none transition focus:border-blue-500/50 ${errors.name ? 'border-red-500/80' : 'border-white/10'}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Email Address</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col">
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      className={`h-12 rounded-xl border bg-[#070d1f] px-4 text-white outline-none transition focus:border-blue-500/50 disabled:opacity-50 ${errors.email ? 'border-red-500/80' : 'border-white/10'}`}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={otpSent}
                      required
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={loading || otpSent || !!errors.email || !formData.email || !!errors.name || !formData.name}
                    className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpSent ? "Sent" : "Verify"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">OTP Code</label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="h-12 w-full rounded-xl border border-blue-500/30 bg-[#070d1f] px-4 tracking-[0.5em] text-center text-lg font-bold text-blue-400 outline-none"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
                <div className={`flex h-12 w-full items-center rounded-xl border bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50 ${errors.password ? 'border-red-500/80' : 'border-white/10'}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="h-full w-full bg-transparent text-white outline-none"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Confirm Password</label>
                <div className={`flex h-12 w-full items-center rounded-xl border bg-[#070d1f] px-4 transition-all focus-within:border-blue-500/50 ${errors.confirmPassword ? 'border-red-500/80' : 'border-white/10'}`}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="h-full w-full bg-transparent text-white outline-none"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#070d1f] px-4 text-white outline-none transition focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#030B1D]">Select State</option>
                  <option value="Punjab" className="bg-[#030B1D]">Punjab</option>
                  <option value="Haryana" className="bg-[#030B1D]">Haryana</option>
                  <option value="Delhi" className="bg-[#030B1D]">Delhi</option>
                  <option value="Himachal Pradesh" className="bg-[#030B1D]">Himachal Pradesh</option>
                  <option value="Uttarakhand" className="bg-[#030B1D]">Uttarakhand</option>
                  <option value="Uttar Pradesh" className="bg-[#030B1D]">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Mohali"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#070d1f] px-4 text-white outline-none transition focus:border-blue-500/50"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-bold text-white shadow-lg shadow-blue-900/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "Create My Account"
                  )}
                </button>
                
                <p className="mt-4 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
