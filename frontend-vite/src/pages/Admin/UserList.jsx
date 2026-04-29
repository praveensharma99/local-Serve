import React, { useState, useEffect } from "react";
import { Users, Mail, Trash2, AlertTriangle, Loader2, Search, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/all-users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          setFilteredUsers(data.users || []);
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) { setFilteredUsers(users); return; }
    setFilteredUsers(
      users.filter((u) =>
        [u.name, u.email, u.city, u.state].some((v) =>
          (v || "").toLowerCase().includes(term)
        )
      )
    );
  }, [searchTerm, users]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete-user/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        const updated = users.filter((u) => u.id !== selectedUser.id);
        setUsers(updated);
        setFilteredUsers(updated);
        toast.success("User successfully deleted");
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Server error: Could not delete user");
    } finally {
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30">
            <Loader2 className="animate-spin text-white" size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">All Users</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage all registered customers • {filteredUsers.length} total
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#12142a] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12142a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-widest text-slate-500">
              <tr>
                {["User Profile", "Email Address", "Location", "Joined Date", "Actions"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 font-bold ${i === 3 || i === 4 ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition hover:bg-violet-500/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-violet-500/30 transition-colors">
                          <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name || "Unnamed User"}</p>
                          <p className="text-xs text-slate-500">Customer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <div>
                          <p className="text-sm text-slate-200">{user.city || "N/A"}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">{user.state || "Not set"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => { setSelectedUser(user); setShowModal(true); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 hover:border-red-400/40 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-sm text-slate-500">
                    {searchTerm ? "No users found matching your search." : "No users found in the system."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#12142a] p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-black text-white">Confirm Deletion</h3>
            <p className="mb-7 leading-relaxed text-sm text-slate-400">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-white">"{selectedUser.name || selectedUser.email}"</span>?
              <br />This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setSelectedUser(null); }}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 transition-colors"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}