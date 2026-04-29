import React, { useState, useEffect } from "react";
import {
  Users, Mail, Phone, IndianRupee, Trash2,
  ExternalLink, Loader2, Search, MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";

export default function ApprovedProviders() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/approved-providers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          const providerList = data.providers || [];
          setProviders(providerList);
          setFilteredProviders(providerList);
        }
      } catch (err) {
        toast.error("Failed to load providers");
      } finally {
        setLoading(false);
      }
    };
    fetchApproved();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) { setFilteredProviders(providers); return; }
    setFilteredProviders(
      providers.filter((p) =>
        [p.User?.name, p.User?.email, p.category, p.phone, p.User?.city, p.User?.state]
          .some((v) => (v || "").toLowerCase().includes(term))
      )
    );
  }, [searchTerm, providers]);

  const handleRemove = async (id) => {
    if (!window.confirm("Kya is verified provider ko permanently remove karna hai?")) return;
    try {
      const res = await fetch(`${backendBaseUrl}/api/admin/delete-provider/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        const updated = providers.filter((p) => p.id !== id);
        setProviders(updated);
        setFilteredProviders(updated);
        toast.success("Provider successfully removed");
      } else {
        toast.error(data.message || "Remove failed");
      }
    } catch {
      toast.error("Server error: Could not remove provider");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
            <Loader2 className="animate-spin text-white" size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Loading Verified Partners...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Verified Partners</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Authorized service providers • {filteredProviders.length} total
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, category or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProviders.map((p) => (
            <ProviderCard key={p.id} p={p} backendBaseUrl={backendBaseUrl} onRemove={handleRemove} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#12142a] p-16 text-center">
          <p className="text-slate-500">
            {searchTerm ? "No matching providers found." : "No verified providers found yet."}
          </p>
        </div>
      )}
    </div>
  );
}

function ProviderCard({ p, backendBaseUrl, onRemove }) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.User?.name || "Provider")}&background=7c5cfc&color=ffffff&bold=true`;
  const picPath = (p.profilePicUrl || p.profile_pic_url)?.replace(/\\/g, "/");

  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-[#12142a] p-5 transition-all hover:border-violet-500/40">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={picPath ? `${backendBaseUrl}/${picPath}` : avatarUrl}
          alt="Profile"
          className="h-16 w-16 shrink-0 rounded-xl object-cover border border-white/10 group-hover:border-violet-500/30 transition-colors"
          onError={(e) => (e.target.src = avatarUrl)}
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-white">{p.User?.name || "Unknown Provider"}</h3>

          <span className="mt-1.5 inline-block rounded-lg border border-violet-500/25 bg-violet-500/15 px-2.5 py-0.5 text-xs font-bold text-violet-300">
            {p.category}
          </span>

          <div className="mt-3 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="truncate">{p.User?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              {p.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">
                {p.User?.city ? `${p.User.city}, ${p.User.state || ""}` : "Location N/A"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex w-fit items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <IndianRupee className="h-3.5 w-3.5" />
            ₹{p.pricePerHour || p.price_per_hour || "0"} /hr
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3 border-t border-white/[0.08] pt-4">
        <button
          onClick={() => {
            const pdf = p.aadharPdfUrl || p.aadhar_pdf_url;
            pdf ? window.open(`${backendBaseUrl}/${pdf.replace(/\\/g, "/")}`, "_blank") : toast.info("No document available");
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-300 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View Doc
        </button>

        <button
          onClick={() => onRemove(p.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 hover:border-red-400/40 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}