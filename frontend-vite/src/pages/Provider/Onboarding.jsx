import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // navigate ke liye
import { toast } from 'react-toastify';
// Lucide Icons Import
import { 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  Phone, 
  Mail, 
  Briefcase, 
  FileText, 
  CheckCircle2,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [userName, setUserName] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    category: '',
    experience: '',
    price: '',
    aadharNo: '',
    profilePic: null,
    aadharFile: null
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (name === "profilePic" && !file.type.startsWith("image/")) {
        return toast.error("Please upload an Image (JPG/PNG)!");
      }
      if (name === "aadharFile" && file.type !== "application/pdf") {
        return toast.error("Aadhar must be in PDF format!");
      }
      setFormData({ ...formData, [name]: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isStep1Valid = formData.phone.length >= 10 && formData.email.includes('@');
  const isStep2Valid = formData.category && formData.experience && formData.price && formData.profilePic;
  const isStep3Valid = formData.aadharNo.length === 12 && formData.aadharFile;

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Agar token nahi mila
    if (!token) {
      toast.error("Session expired! Please login again.");
      return navigate('/login');
    }

    if (!isStep3Valid) return toast.error("Please complete all details!");

    const data = new FormData();
    data.append("phone", formData.phone);
    data.append("category", formData.category);
    data.append("experience", formData.experience);
    data.append("price", formData.price);
    data.append("aadharNo", formData.aadharNo);
    data.append("profilePic", formData.profilePic);
    data.append("aadharFile", formData.aadharFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Sirf Authorization bhejni hai
        },
        body: data // Content-Type browser khud set karega FormData ke liye
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Application Submitted! 🚀");
      } else {
        // Agar token invalid hai toh backend se message aayega
        toast.error(result.message || "Submission failed!");
        if (result.message === "Token is not valid") navigate('/login');
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Server se connect nahi ho paya!");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#020818] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white/[0.03] border border-white/10 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <CheckCircle2 size={48} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Under Review</h2>
          <p className="text-white/60 mb-8">Hamari team verify kar rahi hai. Approval ke baad dashboard unlock ho jayega.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020818] font-['DM_Sans',sans-serif] relative overflow-x-hidden flex flex-col items-center py-10 px-4">
      {/* Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header with Lucide */}
      <div className="w-full max-w-2xl mb-10 text-left z-20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-bold uppercase tracking-[3px]">Provider Onboarding</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <UserCheck size={32} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Hey, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userName || 'Provider'}</span>!
            </h1>
            <p className="text-white/40 mt-1 text-lg flex items-center gap-2">Setup your professional profile <ChevronRight size={18} /></p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-10 backdrop-blur-2xl shadow-2xl">
          
          {/* Progress Stepper with Icons */}
          <div className="flex items-center justify-between mb-12 px-2">
            {[
              { label: "Contact", icon: <Phone size={18} /> },
              { label: "Profession", icon: <Briefcase size={18} /> },
              { label: "Documents", icon: <FileText size={18} /> }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1 relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-3 transition-all duration-500
                  ${step > i + 1 ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
                    step === i + 1 ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' : 'bg-white/5 text-white/20'}`}>
                  {step > i + 1 ? <CheckCircle2 size={20} /> : item.icon}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-[2px] ${step >= i + 1 ? 'text-white' : 'text-white/30'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-white/20" size={20} />
                    <input type="tel" name="phone" placeholder="Mobile Number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition-all" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-white/20" size={20} />
                    <input type="email" name="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-indigo-500 transition-all" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full bg-indigo-600 py-5 mt-4 rounded-2xl text-white font-bold disabled:opacity-20 flex items-center justify-center gap-2">
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] flex items-center gap-5">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                       {formData.profilePic ? <img src={URL.createObjectURL(formData.profilePic)} className="w-full h-full object-cover" /> : <Upload className="text-white/20" />}
                    </div>
                    <div className="flex-1">
                       <label className="text-xs text-white/40 block mb-2 font-bold uppercase tracking-wider">Profile Photo</label>
                       <input type="file" name="profilePic" accept="image/*" className="text-white text-xs block w-full file:bg-white/10 file:border-0 file:rounded-lg file:text-white file:px-3 file:py-1 file:mr-3" onChange={handleChange} />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <select name="category" className="w-full bg-[#0d1117] border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 appearance-none" onChange={handleChange} value={formData.category}>
                      <option value="">Select Service Category</option>
                      <option value="electrician">Electrician</option>
                      <option value="plumber">Plumber</option>
                      <option value="cleaning">Cleaning Services</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input name="experience" type="number" placeholder="Experience (Yrs)" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500" onChange={handleChange} />
                      <input name="price" type="number" placeholder="Price (₹/hr)" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500" onChange={handleChange} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setStep(1)} className="flex-1 border border-white/10 py-4 rounded-2xl text-white flex items-center justify-center gap-2"><ArrowLeft size={18}/> Back</button>
                    <button disabled={!isStep2Valid} onClick={() => setStep(3)} className="flex-[2] bg-indigo-600 py-4 rounded-2xl text-white font-bold disabled:opacity-20 flex items-center justify-center gap-2">Identity Details <ChevronRight size={18}/></button>
                 </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <input name="aadharNo" type="text" required maxLength="12" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500" placeholder="12 Digit Aadhar Number" onChange={handleChange} />
                <div className="group border-2 border-dashed border-indigo-500/20 rounded-[24px] p-10 text-center hover:border-indigo-500/50 transition-all bg-indigo-500/5">
                   <Upload className="mx-auto mb-4 text-indigo-400" size={40} />
                   <p className="text-white/60 text-sm mb-4 font-bold uppercase tracking-widest">Aadhar Card PDF</p>
                   <input type="file" name="aadharFile" accept=".pdf" required className="hidden" id="aadhar" onChange={handleChange} />
                   <label htmlFor="aadhar" className="bg-white/10 px-8 py-3 rounded-2xl text-white text-sm cursor-pointer hover:bg-white/20 transition-all">Upload PDF</label>
                   {formData.aadharFile && <p className="text-green-400 text-xs mt-4 font-medium italic">Selected: {formData.aadharFile.name}</p>}
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 border border-white/10 py-4 rounded-2xl text-white flex items-center justify-center gap-2"><ArrowLeft size={18}/> Back</button>
                  <button type="submit" className="flex-[2] bg-green-600 py-4 rounded-2xl text-white font-bold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">Submit Details <CheckCircle2 size={18}/></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;