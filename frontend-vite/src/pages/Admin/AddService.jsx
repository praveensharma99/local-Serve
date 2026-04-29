import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PlusCircle, Save, Loader2, Trash2, LayoutGrid, ToggleLeft, ToggleRight, Power } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const ICONS = [
  { value: "🛠️", label: "Tools (General)" },
  { value: "🔌", label: "Electrician" },
  { value: "🪠", label: "Plumber" },
  { value: "🧹", label: "Cleaning" },
  { value: "❄️", label: "AC Repair" },
  { value: "🚗", label: "Mechanic" },
  { value: "💡", label: "Light Fix" },
  { value: "🔧", label: "Technician" },
  { value: "🏠", label: "Home Care" },
  { value: "🎨", label: "Painting" },
];

export default function AddService() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🛠️");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [existingServices, setExistingServices] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/get-services?all=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setExistingServices(data.services);
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceName = name.trim();
    if (!serviceName) { toast.error("Service name toh daal do bhai!"); return; }
    if (existingServices.find((s) => s.name.toLowerCase() === serviceName.toLowerCase())) {
      toast.warning("Ye service pehle se hai! Duplicate mat banao.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: serviceName, description: description.trim() || null, icon, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Nayi service add ho gayi!");
        setName("");
        setDescription("");
        setIcon("🛠️");
        setIsActive(true);
        fetchServices();
      } else {
        toast.error(data.message || "Kuch galti hui");
      }
    } catch {
      toast.error("Server error!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, serviceName) => {
    if (!window.confirm(`Kya aap "${serviceName}" ko delete karna chahte hain?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete-service/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.info("Service delete ho gayi.");
        setExistingServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      toast.error("Delete nahi ho paya.");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/toggle-service/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setExistingServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
      } else {
        toast.error(data.message || "Toggle failed");
      }
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Toggle nahi ho paya.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

      {/* LEFT: ADD FORM */}
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <PlusCircle size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Add Service</h1>
            <p className="text-xs text-slate-500 mt-0.5">Configure new platform categories</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#12142a] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Service Name */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Service Name
              </label>
              <input
                type="text"
                placeholder="e.g. Deep Cleaning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0b1a] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Description
              </label>
              <textarea
                placeholder="What does this service include?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0b1a] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors resize-none"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Icon Representation
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0b1a] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/60 transition-colors cursor-pointer"
              >
                {ICONS.map((i) => (
                  <option key={i.value} value={i.value}>{i.value} {i.label}</option>
                ))}
              </select>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0a0b1a] px-4 py-3">
              <div className="flex items-center gap-2">
                {isActive ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-slate-500" />}
                <span className="text-sm font-bold text-white">{isActive ? "Active" : "Inactive"}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-slate-600"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Preview</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{name || "Service name..."}</p>
                  {description && <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isActive ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-black text-white transition-colors hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : <><Save size={18} /> Create Service</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: EXISTING SERVICES */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Services</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {existingServices.filter((s) => s.isActive !== false).length} active · {existingServices.length} total
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-violet-300">
            {existingServices.length} Total
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#12142a] overflow-hidden">
          <div className="max-h-[480px] overflow-y-auto p-3 space-y-2">
            {fetching ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-violet-400" size={18} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading...</span>
              </div>
            ) : existingServices.length > 0 ? (
              existingServices.map((service) => (
                <div
                  key={service.id}
                  className={`group rounded-xl border px-4 py-3 transition-all hover:border-violet-500/25 hover:bg-violet-500/5 ${
                    service.isActive === false
                      ? "border-white/[0.04] bg-white/[0.02] opacity-60"
                      : "border-white/[0.06] bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{service.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                            {service.name}
                          </span>
                          {service.isActive === false && (
                            <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500 border border-slate-500/20">
                              Inactive
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(service.id, service.isActive)}
                        className={`rounded-lg p-2 transition-colors ${
                          service.isActive !== false
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                        }`}
                        title={service.isActive !== false ? "Deactivate Service" : "Activate Service"}
                      >
                        <Power size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete Service"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm text-slate-600 italic">
                No services added yet.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}