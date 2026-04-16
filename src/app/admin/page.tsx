'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Activity, MessageSquare, Image as ImageIcon, Video, Globe, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';

interface Stats {
  total_users: number;
  active_7d: number;
  active_30d: number;
  total_messages: number;
  total_threads: number;
  new_signups_today: number;
  new_signups_week: number;
  new_signups_month: number;
  top_hero: string;
  total_usage_by_type: Record<string, number>;
}

interface User {
  id: string;
  name: string;
  email: string;
  tier: string;
  energy_balance: number;
  created_at: string;
  last_active_at: string | null;
  is_suspended: boolean;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: editUser.tier,
          energy_balance: editUser.energy_balance,
          is_suspended: editUser.is_suspended,
        }),
      });
      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      } else {
        console.error('Update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteUser(null);
        fetchUsers();
      } else {
        console.error('Delete failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      planFilter === 'All Plans' || u.tier.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af] p-8 font-[Rajdhani]">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex items-center gap-4">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="font-[Orbitron] text-2xl uppercase tracking-[0.2em] text-[#D4AF37]">
            EMPIRE COMMAND CENTER
          </h1>
        </header>

        {/* SECTION 1: Stats Dashboard */}
        <section>
          <h2 className="font-[Orbitron] text-sm uppercase tracking-widest text-[#D4AF37] mb-6">
            ✦ PLATFORM INTELLIGENCE
          </h2>
          {loadingStats ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={stats?.total_users} icon={<Users />} />
              <StatCard title="Active (7d)" value={stats?.active_7d} icon={<Activity />} />
              <StatCard title="Active (30d)" value={stats?.active_30d} icon={<Activity />} />
              <StatCard title="Total Messages" value={stats?.total_messages} icon={<MessageSquare />} />
              <StatCard title="Total Chats" value={stats?.total_threads} icon={<MessageSquare />} />
              <StatCard title="Images Generated" value={stats?.total_usage_by_type?.image_generation || 0} icon={<ImageIcon />} />
              <StatCard title="Videos Generated" value={stats?.total_usage_by_type?.video_generation || 0} icon={<Video />} />
              <StatCard title="Websites Generated" value={stats?.total_usage_by_type?.website_generation || 0} icon={<Globe />} />
              <StatCard title="New Today" value={stats?.new_signups_today} icon={<Users />} />
              <StatCard title="New This Week" value={stats?.new_signups_week} icon={<Users />} />
              <StatCard title="New This Month" value={stats?.new_signups_month} icon={<Users />} />
              <StatCard title="Top Hero" value={stats?.top_hero} icon={<Users />} isText />
            </div>
          )}
        </section>

        {/* SECTION 2: User Management Table */}
        <section>
          <h2 className="font-[Orbitron] text-sm uppercase tracking-widest text-[#D4AF37] mb-6">
            ✦ AGENT REGISTRY
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded px-4 py-2 text-[#d0c5af] focus:outline-none focus:border-[#D4AF37]/50"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-4 py-2 text-[#d0c5af] focus:outline-none focus:border-[#D4AF37]/50"
            >
              <option>All Plans</option>
              <option value="free_scout">Free</option>
              <option value="personal_basic">Basic</option>
              <option value="personal_explorer">Explorer</option>
              <option value="pro_starter">Starter</option>
              <option value="pro_standard">Pro</option>
              <option value="business_standard">Standard</option>
              <option value="business_enterprise">Enterprise</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-[rgba(212,175,55,0.12)] rounded-lg bg-[rgba(212,175,55,0.03)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(212,175,55,0.12)] font-[Orbitron] text-[10px] uppercase tracking-widest text-[#D4AF37]">
                  <th className="p-4">#</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Energy</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-white/50">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-b border-[rgba(212,175,55,0.06)] hover:bg-[rgba(212,175,55,0.04)] transition-colors"
                    >
                      <td className="p-4">{i + 1}</td>
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4 opacity-75">{u.email}</td>
                      <td className="p-4 capitalize">{u.tier.replace('_', ' ')}</td>
                      <td className="p-4">{u.energy_balance}</td>
                      <td className="p-4 opacity-75">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 opacity-75">
                        {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-[Orbitron] uppercase rounded ${u.is_suspended ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-2 border border-[#D4AF37]/50 rounded hover:bg-[#D4AF37] hover:text-black transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="p-2 border border-red-500/50 rounded hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modals */}
        {editUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-[#D4AF37]/20 p-6 rounded-lg w-full max-w-md">
              <h3 className="font-[Orbitron] text-lg uppercase text-[#D4AF37] mb-4">Edit Agent</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-[Orbitron] uppercase text-[#D4AF37] mb-1">Tier</label>
                  <select
                    value={editUser.tier}
                    onChange={(e) => setEditUser({ ...editUser, tier: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[#d0c5af] focus:border-[#D4AF37]/50"
                  >
                    <option value="free_scout">Free Scout</option>
                    <option value="personal_basic">Personal Basic</option>
                    <option value="personal_explorer">Personal Explorer</option>
                    <option value="pro_starter">Pro Starter</option>
                    <option value="pro_standard">Pro Standard</option>
                    <option value="business_standard">Business Standard</option>
                    <option value="business_enterprise">Business Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-[Orbitron] uppercase text-[#D4AF37] mb-1">Energy Balance</label>
                  <input
                    type="number"
                    value={editUser.energy_balance}
                    onChange={(e) => setEditUser({ ...editUser, energy_balance: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[#d0c5af] focus:border-[#D4AF37]/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="suspend"
                    checked={editUser.is_suspended}
                    onChange={(e) => setEditUser({ ...editUser, is_suspended: e.target.checked })}
                    className="w-4 h-4 accent-red-500"
                  />
                  <label htmlFor="suspend" className="text-red-400 cursor-pointer">Suspend Account</label>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="px-4 py-2 border border-white/20 rounded hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-[#D4AF37] bg-transparent text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-black font-bold font-[Orbitron] uppercase transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-red-500/20 p-6 rounded-lg w-full max-w-md">
              <h3 className="font-[Orbitron] text-lg uppercase text-red-500 mb-4">Confirm Termination</h3>
              <p className="mb-6 opacity-75">
                Are you sure you want to permanently delete <strong>{deleteUser.name}</strong> ({deleteUser.email})? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="px-4 py-2 border border-white/20 rounded hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 border border-red-500 bg-transparent text-red-500 rounded hover:bg-red-500 hover:text-white font-bold font-[Orbitron] uppercase transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isText = false }: { title: string; value: string | number | undefined | null; icon: React.ReactNode; isText?: boolean }) {
  return (
    <div className="border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.03)] p-6 rounded-lg flex flex-col justify-between h-32">
      <div className="flex justify-between items-start text-[#D4AF37]">
        <h3 className="font-[Orbitron] text-[10px] uppercase tracking-widest">{title}</h3>
        <div className="opacity-50">{icon}</div>
      </div>
      <div className={`mt-auto font-bold ${isText ? 'text-xl font-[Orbitron] truncate' : 'text-4xl font-[Cinzel_Decorative]'}`}>
        {value ?? '-'}
      </div>
    </div>
  );
}
