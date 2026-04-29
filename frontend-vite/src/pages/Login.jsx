import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Token aur User Info save karo
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 2. Role ko alag se bhi save karlo taaki Protected Routes mein kaam aaye
        localStorage.setItem('role', data.user.role); 

        toast.success(`Welcome back, ${data.user.name}! 🚀`);

        // 3. Role-Based Redirection Logic ⚡
        setTimeout(() => {
          const role = data.user.role;

          if (role === 'admin') {
            navigate('/admin'); // Admin Dashboard
          } else if (role === 'provider') {
            navigate('/provider'); // Service Provider ka apna page
          } else {
            navigate('/dashboard'); // Normal User ka page
          }
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
    <div className="min-h-screen w-full flex bg-[#020818] font-['DM_Sans',sans-serif] overflow-hidden">
      
      {/* --- Left Side (Brand & Visuals) --- */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              🔧
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Local<span className="text-indigo-400">Serve</span>
            </h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Connecting You to <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Expert Pros.</span>
          </h2>
          
          <p className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Welcome back! Log in to access your dashboard and manage your services with ease.
          </p>

          <div className="grid grid-cols-1 gap-4 text-left max-w-xs mx-auto">
            {['🔒 Secure AES-256 Login', '⚡ Instant Service Access', '🛡️ Data Privacy Guaranteed'].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <span className="text-indigo-400">✔</span> {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Right Side (Login Form) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Orbs */}
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px]"></div>

        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-8 sm:p-10 rounded-[32px] backdrop-blur-xl shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/40">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-white/20"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-white/70">Password</label>
                <span className="text-xs text-indigo-400 cursor-pointer hover:underline">Forgot?</span>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder:text-white/20"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>🔐 <span className="ml-1">Sign In</span></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-white/40 text-sm">
            Don’t have an account?{' '}
            <button 
              onClick={() => navigate('/register')} 
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;