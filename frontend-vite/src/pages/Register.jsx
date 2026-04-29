import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          city: formData.city,
          state: formData.state,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account Created! 🚀");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          if (data.user.role === "provider") {
            navigate("/onboarding");
          } else {
            navigate("/login");
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
    <div className="min-h-screen w-full flex bg-[#020818] font-['DM_Sans',sans-serif] overflow-x-hidden">
      {/* --- Left Side (Hero Visuals) --- */}
      <div className="hidden lg:flex w-[40%] relative flex-col items-center justify-center p-12">
        {/* Background Mesh/Glow */}
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              🔧
            </div>
            <h1 className="text-3xl font-bold text-white">
              Local<span className="text-indigo-400">Serve</span>
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
            Start Your <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Journey With Us.
            </span>
          </h2>

          <div className="space-y-6">
            {[
              { icon: "👥", text: "500+ Verified Professionals" },
              { icon: "⚡", text: "Quick 30-Min Response" },
              { icon: "💎", text: "Premium Quality Service" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/60">
                <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                  {item.icon}
                </span>
                <span className="text-lg font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Right Side (Registration Form) --- */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-[40px] backdrop-blur-2xl shadow-2xl overflow-y-auto max-h-[95vh] scrollbar-hide">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-white/40">
              Fill in the details to join the community
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Account Type (Interactive Cards) */}
            <div className="md:col-span-2 space-y-3 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                I want to...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User Role */}
                <div
                  onClick={() => setFormData({ ...formData, role: "user" })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                    formData.role === "user"
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl">👤</div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Find Services
                    </h4>
                    <p className="text-white/40 text-xs">Book expert pros</p>
                  </div>
                </div>

                {/* Provider Role */}
                <div
                  onClick={() => setFormData({ ...formData, role: "provider" })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                    formData.role === "provider"
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl">🔧</div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Provide Service
                    </h4>
                    <p className="text-white/40 text-xs">Start earning today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2 md:col-span-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Address + Verify */}
            <div className="space-y-2 md:col-span-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                Email Address
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={otpSent}
                  required
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loading || otpSent}
                  className="bg-white/10 hover:bg-white/20 disabled:bg-emerald-500/20 disabled:border-emerald-500/30 border border-white/10 text-white font-semibold px-5 py-4 rounded-2xl transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-2"
                >
                  {loading && !otpSent ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : otpSent ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-emerald-400">Sent</span>
                    </>
                  ) : (
                    <>Verify</>
                  )}
                </button>
              </div>
              {otpSent && (
                <p className="text-xs text-emerald-400/70 ml-1">
                  OTP sent to {formData.email}
                </p>
              )}
            </div>

            {/* OTP Input */}
            {otpSent && (
              <div className="space-y-2 md:col-span-2 text-left">
                <label className="text-sm font-medium text-white/70 ml-1">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all tracking-widest text-center font-bold text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <p className="text-xs text-white/30 text-center">
                  Valid for 10 minutes
                </p>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* --- City & State Row --- */}
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="" className="bg-[#020818]">
                  Select State
                </option>
                <option value="Punjab" className="bg-[#020818]">
                  Punjab
                </option>
                <option value="Haryana" className="bg-[#020818]">
                  Haryana
                </option>
                <option value="Delhi" className="bg-[#020818]">
                  Delhi
                </option>
                <option value="Himachal Pradesh" className="bg-[#020818]">
                  Himachal Pradesh
                </option>
                <option value="Uttarakhand" className="bg-[#020818]">
                  Uttarakhand
                </option>
                <option value="Uttar Pradesh" className="bg-[#020818]">
                  Uttar Pradesh
                </option>
              </select>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-white/70 ml-1">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Mohali"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 transition-all"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-8 text-white/40 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-400 font-bold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
