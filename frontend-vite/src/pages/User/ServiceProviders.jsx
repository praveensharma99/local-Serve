import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Star, ArrowLeft, Loader2 } from "lucide-react";
import BookingModal from "./BookingModal";
import { API_BASE_URL } from "../../config/api";

export default function ServiceProviders() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");
  const decodedCategory = decodeURIComponent(category || "");
  const decodedCity = city ? decodeURIComponent(city) : "";

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //Booking Model
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${API_BASE_URL}/api/user/providers?category=${encodeURIComponent(decodedCategory)}${decodedCity ? `&city=${encodeURIComponent(decodedCity)}` : ''}`;
        
        const res = await fetch(url, { headers });
        const data = await res.json();
        if (data.success) setProviders(data.providers);
        else setProviders([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (decodedCategory) fetchProviders();
    else setLoading(false);
  }, [decodedCategory, decodedCity]);

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-16">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white capitalize">
            {decodedCategory} Experts
          </h1>
          <p className="text-slate-500 flex items-center gap-1 font-bold text-xs uppercase tracking-widest">
            <MapPin size={14} className="text-indigo-500" /> Available in{" "}
            {decodedCity || "All Cities"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {providers.length > 0 ? (
          providers.map((pro) => {
            const profilePic = (
              pro.profilePicUrl ||
              pro.profile_pic_url ||
              ""
            ).replace(/\\/g, "/");
            const price = pro.pricePerHour || pro.price_per_hour || "N/A";
            const experience = pro.experience || pro.experience_years || 5;

            return (
              <div
                key={pro.id}
                className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex gap-6 mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/20 overflow-hidden shrink-0">
                    <img
                      src={
                        profilePic
                          ? `${API_BASE_URL}/${profilePic}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.user?.name || pro.User?.name || "Provider")}`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {pro.user?.name || pro.User?.name || "Provider"}
                    </h3>
                    <p className="text-indigo-400 font-black text-xs uppercase tracking-tighter flex items-center gap-1">
                      <Star size={14} fill="currentColor" /> 4.9 (85 Reviews)
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      {experience} Years Experience
                    </p>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-400" />
                      {pro.user?.city ? pro.user.city : "Unknown"}{pro.user?.state ? `, ${pro.user.state}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-white/5 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Price Starts
                    </p>
                    <p className="text-2xl font-black text-white italic">
                      Rs. {price}
                      <span className="text-xs text-slate-500 font-normal">
                        /hr
                      </span>
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black uppercase">
                    Verified
                  </div>
                </div>

                <button
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      navigate("/login");
                    } else {
                      setSelectedProvider(pro);
                      setIsModalOpen(true);
                    }
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/20"
                >
                  Book Appointment
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-[3rem]">
            Sorry, no {decodedCategory} found {decodedCity ? `in ${decodedCity}` : "yet"}.
          </div>
        )}
      </div>
      {isModalOpen && selectedProvider && (
        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          provider={selectedProvider} 
        />
      )}
    </div>
  );
}
