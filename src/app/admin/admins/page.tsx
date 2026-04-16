/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    role: "cx"
  });

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (res.status === 403) {
        router.push("/admin/dashboard");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create admin");
      } else {
        setIsModalOpen(false);
        setNewAdmin({ username: "", email: "", password: "", role: "cx" });
        fetchAdmins();
      }
    } catch (error) {
      alert("Error creating admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this admin account?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/admins?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to deactivate admin");
      } else {
        fetchAdmins();
      }
    } catch (error) {
      alert("Error deactivating admin");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case "super_admin": return "text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10";
      case "leader": return "text-purple-400 border-purple-400/50 bg-purple-400/10";
      case "cx": return "text-cyan-400 border-cyan-400/50 bg-cyan-400/10";
      default: return "text-white/50 border-white/20 bg-white/5";
    }
  };

  if (loading && admins.length === 0) {
     return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-[Orbitron] text-2xl font-bold tracking-[3px] text-white uppercase">
            ✦ COMMAND ACCESS
          </h1>
          <p className="font-[Rajdhani] text-sm text-white/50 mt-1">
            Super Admin Controls - Managing internal operatives.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] text-black hover:bg-[#FFD700] px-4 py-2 rounded text-xs font-[Orbitron] font-bold tracking-[2px] uppercase transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          ADD ADMIN ACCOUNT
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80 font-[Rajdhani]">
            <thead className="bg-black/50 border-b border-white/5 font-[Orbitron] text-[10px] tracking-[2px] uppercase text-[#D4AF37]">
              <tr>
                <th className="px-6 py-4">Operative</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white font-[Orbitron] tracking-[1px]">{admin.username}</div>
                    <div className="text-white/50 text-xs">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 border rounded text-[10px] font-[Orbitron] tracking-[1px] uppercase ${getRoleBadgeColor(admin.role)}`}>
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {admin.is_active ? (
                      <span className="text-emerald-500 text-xs font-[Orbitron] tracking-[1px]">ACTIVE</span>
                    ) : (
                      <span className="text-red-500 text-xs font-[Orbitron] tracking-[1px]">DEACTIVATED</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/50 text-xs">
                    {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {admin.is_active && (
                      <button
                        onClick={() => handleDeactivate(admin.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
                        title="Deactivate Account"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-[#D4AF37]/30 rounded w-full max-w-md p-6 relative">
            <h3 className="font-[Orbitron] text-lg font-bold text-white tracking-[2px] uppercase mb-6">
              Deploy New Operative
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1 uppercase">Admin ID (Username)</label>
                <input
                  type="text"
                  required
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1 uppercase">Temporary Access Key</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1 uppercase">Clearance Level</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white font-[Orbitron] tracking-[1px] uppercase focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="cx">CX (Support)</option>
                  <option value="leader">Leader</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 py-2 rounded text-xs font-[Orbitron] tracking-[2px] uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-[#D4AF37] text-black hover:bg-[#FFD700] py-2 rounded text-xs font-[Orbitron] font-bold tracking-[2px] uppercase transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
