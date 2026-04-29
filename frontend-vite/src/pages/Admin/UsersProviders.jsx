import React, { useState, useEffect } from "react";
import {
  Users, Mail, Trash2, AlertTriangle, Loader2, Search, MapPin,
  Info, Phone, IndianRupee, FileText, X, Wrench, UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";

export default function UsersProviders() {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "providers"
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [uRes, pRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/all-users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/approved-providers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const uData = await uRes.json();
        const pData = await pRes.json();
        if (uData.success) setUsers(uData.users || []);
        if (pData.success) setProviders(pData.providers || []);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const source = activeTab === "users" ? users : providers;
    if (!term) {
      setFiltered(source);
      return;
    }
    if (activeTab === "users") {
      setFiltered(
        users.filter((u) =>
          [u.name, u.email, u.city, u.state].some((v) =>
            (v || "").toLowerCase().includes(term)
          )
        )
      );
    } else {
      setFiltered(
        providers.filter((p) =>
          [p.User?.name, p.User?.email, p.category, p.phone, p.User?.city, p.User?.state]
            .some((v) => (v || "").toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, users, providers, activeTab]);

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      const token = localStorage.getItem("token");
      const isUser = activeTab === "users";
      const url = isUser
        ? `${API_BASE_URL}/api/admin/delete-user/${selectedItem.id}`
        : `${API_BASE_URL}/api/admin/delete-provider/${selectedItem.id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        if (isUser) {
          const updated = users.filter((u) => u.id !== selectedItem.id);
          setUsers(updated);
        } else {
          const updated = providers.filter((p) => p.id !== selectedItem.id);
          setProviders(updated);
        }
        toast.success(data.message || "Deleted successfully");
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Server error during deletion");
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
            <Loader2 className="animate-spin text-white" size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const sourceList = activeTab === "users" ? users : providers;
  const displayList = filtered;

  return (
    <div className="space-y-6 relative">
      {/* Header + Toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Users & Providers</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {users.length} users · {providers.length} providers
            </p>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("users"); setSearchTerm(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "users"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-[#12142a] text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/20"
            }`}
          >
            <Users className="h-4 w-4" /> Normal Users
          </button>
          <button
            onClick={() => { setActiveTab("providers"); setSearchTerm(""); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "providers"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-[#12142a] text-slate-400 border border-white/[0.08] hover:text-white hover:border-white/20"
            }`}
          >
            <Wrench className="h-4 w-4" /> Service Providers
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={activeTab === "users" ? "Search users by name, email, city..." : "Search providers by name, category, city..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/60 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12142a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-widest text-slate-500">
              <tr>
                {activeTab === "users" ? (
                  <>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Location</th>
                    <th className="px-6 py-4 font-bold text-center">Joined</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 font-bold">Provider</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Location</th>
                    <th className="px-6 py-4 font-bold">Price</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {displayList.length > 0 ? (
                displayList.map((item) => (
                  <tr key={item.id} className="group transition hover:bg-violet-500/5">
                    {activeTab === "users" ? (
                      <UserRow
                        user={item}
                        onDelete={() => { setSelectedItem(item); setShowDeleteModal(true); }}
                      />
                    ) : (
                      <ProviderRow
                        provider={item}
                        onDelete={() => { setSelectedItem(item); setShowDeleteModal(true); }}
                        onInfo={() => setDrawerItem(item)}
                      />
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-slate-500">
                    {searchTerm ? "No results found." : `No ${activeTab} found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Drawer (Providers only) */}
      {drawerItem && activeTab === "providers" && (
        <InfoDrawer provider={drawerItem} onClose={() => setDrawerItem(null)} />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#12142a] p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-black text-white">Confirm Deletion</h3>
            <p className="mb-7 leading-relaxed text-sm text-slate-400">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-white">
                "{activeTab === "users" ? (selectedItem.name || selectedItem.email) : (selectedItem.User?.name || "Provider")}"
              </span>?
              <br />This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onDelete }) {
  return (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-violet-500/30 transition-colors">
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-white">{user.name || "Unnamed"}</p>
            <p className="text-xs text-slate-500">Customer</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          {user.email || "—"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="text-sm text-slate-200">{user.city || "N/A"}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center text-sm text-slate-400">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 hover:border-red-400/40 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </td>
    </>
  );
}

function ProviderRow({ provider, onDelete, onInfo }) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.User?.name || "P")}&background=7c5cfc&color=ffffff&bold=true`;
  const picPath = (provider.profilePicUrl || provider.profile_pic_url)?.replace(/\\/g, "/");
  const profileUrl = picPath ? `${API_BASE_URL}/${picPath}` : avatarUrl;

  return (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={profileUrl}
            alt=""
            className="h-10 w-10 rounded-xl object-cover border border-white/10 group-hover:border-violet-500/30 transition-colors"
            onError={(e) => { e.currentTarget.src = avatarUrl; }}
          />
          <div>
            <p className="font-bold text-white">{provider.User?.name || "Unknown"}</p>
            <p className="text-xs text-slate-500">{provider.User?.email || "No email"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="rounded-lg border border-violet-500/25 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
          {provider.category || "General"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="text-sm text-slate-200">
            {provider.User?.city ? `${provider.User.city}, ${provider.User.state || ""}` : "N/A"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
          <IndianRupee className="h-3.5 w-3.5" />
          {provider.pricePerHour || provider.price_per_hour || "0"}/hr
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onInfo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
            title="View details"
          >
            <Info className="h-3.5 w-3.5" /> Info
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 hover:border-red-400/40 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </td>
    </>
  );
}

function InfoDrawer({ provider, onClose }) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.User?.name || "P")}&background=7c5cfc&color=ffffff&bold=true`;
  const picPath = (provider.profilePicUrl || provider.profile_pic_url)?.replace(/\\/g, "/");
  const profileUrl = picPath ? `${API_BASE_URL}/${picPath}` : avatarUrl;
  const docPath = (provider.aadharPdfUrl || provider.aadhar_pdf_url)?.replace(/\\/g, "/");

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-[999] h-full w-full max-w-md border-l border-white/[0.08] bg-[#0d0e20] shadow-2xl overflow-y-auto animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#0d0e20]/95 backdrop-blur-md px-6 py-4">
          <h2 className="text-lg font-black text-white">Provider Details</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <div className="flex flex-col items-center text-center">
            <img
              src={profileUrl}
              alt=""
              className="h-24 w-24 rounded-2xl object-cover border-2 border-white/10 shadow-xl"
              onError={(e) => { e.currentTarget.src = avatarUrl; }}
            />
            <h3 className="mt-4 text-xl font-black text-white">{provider.User?.name || "Unknown"}</h3>
            <span className="mt-1.5 inline-block rounded-lg border border-violet-500/25 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
              {provider.category || "General"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <DetailRow icon={Mail} label="Email" value={provider.User?.email || "—"} />
            <DetailRow icon={Phone} label="Phone" value={provider.phone || "—"} />
            <DetailRow icon={MapPin} label="Location" value={provider.User?.city ? `${provider.User.city}, ${provider.User.state || ""}` : "—"} />
            <DetailRow icon={IndianRupee} label="Rate" value={`₹${provider.pricePerHour || provider.price_per_hour || "0"} / hour`} />
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#12142a] p-5">
            <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-400" /> Documents
            </h4>
            {docPath ? (
              <a
                href={`${API_BASE_URL}/${docPath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/5 p-4 hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-white truncate group-hover:text-violet-300 transition-colors">Aadhar Document</p>
                  <p className="text-xs text-slate-500">Click to view PDF</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.06] bg-white/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10 text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">No documents uploaded</p>
                  <p className="text-xs text-slate-600">Aadhar verification pending</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12142a] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
