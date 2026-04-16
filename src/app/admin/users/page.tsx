/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Edit2, Trash2, Eye, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

// Define role based on decoded JWT or similar from layout if passed.
// For simplicity we will decode the cookie or just try endpoints to see if we have access.
// Let's assume the server API blocks unauthorized actions anyway.
// Ideally, we'd fetch the admin's profile/role on mount or pass it via context.

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Quick way to get role info safely: just check if actions succeed or fail
  // A better way is to add an endpoint like /api/admin/me
  // For UI, we'll show edit/delete to everyone but handle errors gracefully.

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      url.searchParams.set("page", page.toString());
      if (search) url.searchParams.set("search", search);
      if (tierFilter) url.searchParams.set("tier", tierFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, tierFilter]);

  // Handle Search on enter or button click
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: editingUser.tier,
          energy_balance: Number(editingUser.energy_balance),
          is_suspended: editingUser.is_suspended,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update user");
      } else {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      alert("Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    const user = users.find(u => u.id === deleteUserId);
    if (deleteConfirm !== user?.username) {
      alert("Username does not match");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      } else {
        setDeleteUserId(null);
        setDeleteConfirm("");
        fetchUsers();
      }
    } catch (error) {
      alert("Error deleting user");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="font-[Orbitron] text-2xl font-bold tracking-[3px] text-white uppercase">
            ✦ AGENT REGISTRY
          </h1>
          <p className="font-[Rajdhani] text-sm text-white/50 mt-1">
            Managing {total} registered commanders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search email/username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111] border border-white/10 rounded pl-9 pr-4 py-2 text-sm text-white font-[Rajdhani] focus:outline-none focus:border-[#D4AF37]/50"
            />
          </form>

          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(0); }}
            className="bg-[#111] border border-white/10 rounded px-4 py-2 text-sm text-white font-[Orbitron] focus:outline-none focus:border-[#D4AF37]/50 appearance-none uppercase tracking-[1px]"
          >
            <option value="">All Plans</option>
            <option value="free_scout">Free Scout</option>
            <option value="personal_basic">Personal Basic</option>
            <option value="personal_pro">Personal Pro</option>
            <option value="business_standard">Business Standard</option>
            <option value="business_enterprise">Business Enterprise</option>
          </select>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80 font-[Rajdhani]">
            <thead className="bg-black/50 border-b border-white/5 font-[Orbitron] text-[10px] tracking-[2px] uppercase text-[#D4AF37]">
              <tr>
                <th className="px-6 py-4">Username / Email</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Grid Energy</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{user.username}</div>
                    <div className="text-white/50 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-[Orbitron] tracking-[1px] uppercase">
                      {user.tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-[Cinzel_Decorative] text-[#D4AF37]">
                    {user.energy_balance}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_suspended ? (
                      <span className="text-amber-500 text-xs font-[Orbitron] tracking-[1px] flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded w-max">
                        <ShieldAlert className="w-3 h-3" /> SUSPENDED
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-xs font-[Orbitron] tracking-[1px] bg-emerald-500/10 px-2 py-1 rounded w-max inline-block">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteUserId(user.id)}
                        className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/50">
          <span className="text-xs font-[Orbitron] tracking-[1px] text-white/50">
            PAGE {page + 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-[#111] border border-white/10 rounded text-xs font-[Orbitron] tracking-[1px] disabled:opacity-50 hover:border-[#D4AF37]/50 transition-colors"
            >
              PREV
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < 50} // Assuming limit 50
              className="px-3 py-1 bg-[#111] border border-white/10 rounded text-xs font-[Orbitron] tracking-[1px] disabled:opacity-50 hover:border-[#D4AF37]/50 transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-[#D4AF37]/30 rounded w-full max-w-md p-6 relative">
            <h3 className="font-[Orbitron] text-lg font-bold text-white tracking-[2px] uppercase mb-6">
              Edit Commander
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1">Tier</label>
                <select
                  value={editingUser.tier}
                  onChange={(e) => setEditingUser({...editingUser, tier: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="free_scout">Free Scout</option>
                  <option value="personal_basic">Personal Basic</option>
                  <option value="personal_pro">Personal Pro</option>
                  <option value="business_standard">Business Standard</option>
                  <option value="business_enterprise">Business Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-[Orbitron] tracking-[1px] text-[#D4AF37] mb-1">Energy Balance</label>
                <input
                  type="number"
                  value={editingUser.energy_balance}
                  onChange={(e) => setEditingUser({...editingUser, energy_balance: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="suspend"
                  checked={editingUser.is_suspended}
                  onChange={(e) => setEditingUser({...editingUser, is_suspended: e.target.checked})}
                  className="accent-amber-500 w-4 h-4"
                />
                <label htmlFor="suspend" className="text-sm font-[Orbitron] tracking-[1px] text-amber-500 uppercase cursor-pointer">
                  Suspend Account
                </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 py-2 rounded text-xs font-[Orbitron] tracking-[2px] uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-[#D4AF37] text-black hover:bg-[#FFD700] py-2 rounded text-xs font-[Orbitron] font-bold tracking-[2px] uppercase transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-red-500/30 rounded w-full max-w-md p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-[Orbitron] text-lg font-bold text-red-500 tracking-[2px] uppercase mb-2">
              Confirm Deletion
            </h3>
            <p className="font-[Rajdhani] text-sm text-white/70 mb-6">
              This will permanently delete the user. Type their username <strong className="text-white">({users.find(u => u.id === deleteUserId)?.username})</strong> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-red-500 mb-6"
              placeholder="Type username..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteUserId(null); setDeleteConfirm(""); }}
                className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 py-2 rounded text-xs font-[Orbitron] tracking-[2px] uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading || deleteConfirm !== users.find(u => u.id === deleteUserId)?.username}
                className="flex-1 bg-red-600 text-white hover:bg-red-500 py-2 rounded text-xs font-[Orbitron] font-bold tracking-[2px] uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Purge User"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
