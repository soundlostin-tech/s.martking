"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Search, 
  Loader2, 
  Eye, 
  ShieldAlert, 
  Ban, 
  MoreVertical,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Clock,
  Globe2 as Globe,
  Trophy,
  Swords,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Download,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
  phone: string;
  country: string;
  win_rate: number;
  matches_played: number;
  balance: number;
  lifetime_earnings: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_users_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      
      const total = data?.length || 0;
      const active = data?.filter(u => u.status === 'Active').length || 0;
      const suspended = data?.filter(u => ['Suspended', 'Banned'].includes(u.status)).length || 0;

      setStats({ total, active, suspended });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserProfile>) => {
    setUpdatingId(id);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      if (adminUser) {
        await supabase.from("audit_logs").insert({
          admin_id: adminUser.id,
          action: "UPDATE_USER_STATUS",
          target_id: id,
          target_type: "profile",
          details: updates
        });
      }

      toast.success("User protocol updated");
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, ...updates } as UserProfile);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'Active' | 'Suspended' | 'Banned') => {
    if (selectedUserIds.length === 0) return;
    
    setLoading(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update({ status: action })
        .in("id", selectedUserIds);

      if (error) throw error;

      if (adminUser) {
        await supabase.from("audit_logs").insert({
          admin_id: adminUser.id,
          action: `BULK_${action.toUpperCase()}`,
          details: { user_ids: selectedUserIds }
        });
      }

      toast.success(`Updated ${selectedUserIds.length} users`);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const matchesSearch = 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortBy === "balance") {
      result.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    } else if (sortBy === "winrate") {
      result.sort((a, b) => (b.win_rate || 0) - (a.win_rate || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy]);

  return (
    <main className="min-h-screen pb-32 bg-[#F5F5F5] text-[#1A1A1A]">
      <div className="px-8 pt-24 relative z-10 space-y-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">Registry Command</p>
            <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
              OPERATIVES <br />
              <span className="text-[#6B7280]/40">DATABASE</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full bg-[#5FD3BC] animate-pulse" />
            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">DATA CHANNEL ACTIVE</p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BentoCard variant="mint" className="p-8 h-48 flex flex-col justify-between overflow-hidden relative shadow-xl border-none">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-4">Total Operatives</p>
              <h3 className="text-5xl font-heading font-black text-[#1A1A1A]">{stats.total.toLocaleString()}</h3>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] rotate-[-15deg] opacity-[0.05] pointer-events-none">
              <Users size={140} />
            </div>
          </BentoCard>

          <BentoCard variant="blue" className="p-8 h-48 flex flex-col justify-between overflow-hidden relative shadow-xl border-none">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-4">Active Signals</p>
              <h3 className="text-5xl font-heading font-black text-[#1A1A1A]">{stats.active.toLocaleString()}</h3>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] rotate-[15deg] opacity-[0.05] pointer-events-none">
              <UserCheck size={140} />
            </div>
          </BentoCard>

          <BentoCard variant="pink" className="p-8 h-48 flex flex-col justify-between overflow-hidden relative shadow-xl border-none">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest mb-4">Restricted Access</p>
              <h3 className="text-5xl font-heading font-black text-[#1A1A1A]">{stats.suspended.toLocaleString()}</h3>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] rotate-[-5deg] opacity-[0.05] pointer-events-none">
              <ShieldAlert size={140} />
            </div>
          </BentoCard>
        </section>

        <AnimatePresence>
          {selectedUserIds.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-[#1A1A1A] text-white px-10 py-5 rounded-[32px] shadow-2xl flex items-center gap-10 border-4 border-white"
            >
              <p className="text-[11px] font-black uppercase tracking-widest">
                {selectedUserIds.length} Warriors Selected
              </p>
              <div className="h-8 w-0.5 bg-white/10" />
              <div className="flex gap-6">
                <button onClick={() => handleBulkAction('Active')} className="text-[11px] font-black uppercase tracking-widest text-[#A8E6CF] hover:scale-110 transition-transform">ACTIVATE</button>
                <button onClick={() => handleBulkAction('Suspended')} className="text-[11px] font-black uppercase tracking-widest text-[#FFD8B1] hover:scale-110 transition-transform">SUSPEND</button>
                <button onClick={() => handleBulkAction('Banned')} className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:scale-110 transition-transform">TERMINATE</button>
              </div>
              <div className="h-8 w-0.5 bg-white/10" />
              <button onClick={() => setSelectedUserIds([])} className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white">CANCEL</button>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[40px] shadow-xl border-2 border-[#E5E7EB]">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={22} strokeWidth={3} />
            <Input 
              className="bg-[#F5F5F5] border-none pl-14 rounded-2xl h-16 text-sm font-black focus-visible:ring-[#1A1A1A] placeholder:text-[#9CA3AF] text-[#1A1A1A]" 
              placeholder="SEARCH REGISTRY..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-3 px-6 h-16 bg-[#F5F5F5] rounded-2xl">
              <Checkbox 
                checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUserIds(filteredUsers.map(u => u.id));
                  } else {
                    setSelectedUserIds([]);
                  }
                }}
                className="w-6 h-6 rounded-lg data-[state=checked]:bg-[#1A1A1A] border-2 border-[#D1D5DB]"
              />
              <span className="text-[10px] font-black tracking-widest text-[#6B7280] uppercase">SELECT ALL</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="SORT BY" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="newest" className="text-[10px] font-black py-3 rounded-xl">NEWEST</SelectItem>
                <SelectItem value="balance" className="text-[10px] font-black py-3 rounded-xl">BALANCE</SelectItem>
                <SelectItem value="winrate" className="text-[10px] font-black py-3 rounded-xl">WIN RATE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="ROLE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="all" className="text-[10px] font-black py-3 rounded-xl">ALL ROLES</SelectItem>
                <SelectItem value="Pro Player" className="text-[10px] font-black py-3 rounded-xl">PLAYER</SelectItem>
                <SelectItem value="Admin" className="text-[10px] font-black py-3 rounded-xl">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="all" className="text-[10px] font-black py-3 rounded-xl">ALL STATUS</SelectItem>
                <SelectItem value="Active" className="text-[10px] font-black py-3 rounded-xl">ACTIVE</SelectItem>
                <SelectItem value="Suspended" className="text-[10px] font-black py-3 rounded-xl">SUSPENDED</SelectItem>
                <SelectItem value="Banned" className="text-[10px] font-black py-3 rounded-xl">BANNED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center gap-6">
              <Loader2 className="w-14 h-14 animate-spin text-[#1A1A1A]/10" />
              <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-[0.4em]">Acquiring Registry Access...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((u, idx) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                    <BentoCard 
                      className="p-10 border-none shadow-lg cursor-pointer group hover:shadow-2xl transition-all relative overflow-hidden bg-white"
                      onClick={() => { setSelectedUser(u); setIsDetailOpen(true); }}
                    >
                      <div 
                        className="absolute top-6 left-6 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox 
                          checked={selectedUserIds.includes(u.id)}
                          onCheckedChange={() => toggleUserSelection(u.id)}
                          className="w-6 h-6 rounded-lg data-[state=checked]:bg-[#1A1A1A] border-2 border-[#D1D5DB]"
                        />
                      </div>
                      <div className="flex justify-between items-start mb-10">
                        <div className="relative">
                          <Avatar className="w-24 h-24 border-4 border-[#F5F5F5] shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <AvatarImage src={u.avatar_url} />
                            <AvatarFallback className="bg-[#1A1A1A] text-white text-3xl font-heading font-black">
                              {u.full_name?.substring(0, 2).toUpperCase() || "SK"}
                            </AvatarFallback>
                          </Avatar>
                          {u.status === 'Active' && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#5FD3BC] rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                              <UserCheck size={14} className="text-[#1A1A1A]" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <StatusBadge variant={u.status === 'Active' ? 'completed' : u.status === 'Suspended' ? 'pending' : 'failed'} className="px-4 py-1.5 text-[9px] font-black" />
                          <div className="px-3 py-1 bg-[#F5F5F5] rounded-xl border border-[#E5E7EB]">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">{u.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-10">
                        <h4 className="text-2xl font-heading font-black text-[#1A1A1A] leading-tight tracking-tight group-hover:text-[#5FD3BC] transition-colors">{u.full_name}</h4>
                        <p className="text-[11px] font-black text-[#6B7280] tracking-[0.2em] uppercase">TAG: @{u.username || 'unidentified'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-8 border-t-2 border-[#F5F5F5]">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1">TOTAL LOOT</p>
                          <p className="text-xl font-heading font-black text-[#1A1A1A]">₹{u.lifetime_earnings?.toLocaleString() || 0}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mb-1">EFFICIENCY</p>
                          <p className="text-xl font-heading font-black text-[#1A1A1A]">{u.win_rate || 0}%</p>
                        </div>
                      </div>
                      
                      <div className="absolute right-[-30px] bottom-[-30px] opacity-[0.02] rotate-12 group-hover:opacity-[0.05] transition-opacity">
                        <Swords size={160} />
                      </div>
                    </BentoCard>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[48px] shadow-2xl border-none flex flex-col items-center gap-8 mx-4">
              <div className="w-24 h-24 rounded-[32px] bg-[#F5F5F5] flex items-center justify-center rotate-6 shadow-inner">
                <AlertCircle size={48} strokeWidth={1} className="text-[#9CA3AF]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter">NO WARRIORS CLASSIFIED</h3>
                <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Adjust scan filters to detect operatives</p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
                className="px-12 py-5 bg-[#1A1A1A] text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-2xl"
              >
                RESET REGISTRY SCAN
              </motion.button>
            </div>
          )}
        </section>
      </div>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-white border-none w-full sm:max-w-2xl p-0 overflow-y-auto no-scrollbar text-[#1A1A1A] rounded-l-[48px] shadow-2xl">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <div className="p-12 bg-[#B3E5FC] relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <StatusBadge variant={selectedUser.status === 'Active' ? 'completed' : 'failed'} className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full font-black text-[10px]" />
                    <button className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[#1A1A1A] shadow-lg hover:scale-110 transition-transform">
                      <Download size={24} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                      <Avatar className="w-40 h-40 border-8 border-white/40 shadow-2xl relative z-10">
                        <AvatarImage src={selectedUser.avatar_url} />
                        <AvatarFallback className="bg-[#1A1A1A] text-[#B3E5FC] text-5xl font-heading font-black">
                          {selectedUser.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-4 text-center md:text-left">
                      <div className="bg-[#1A1A1A] text-white px-4 py-1 rounded-xl inline-block shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">OP_ID: {selectedUser.id.slice(0, 12).toUpperCase()}</p>
                      </div>
                      <SheetTitle className="text-[#1A1A1A] text-5xl font-heading font-black leading-tight tracking-tighter">{selectedUser.full_name}</SheetTitle>
                      <p className="text-[#1A1A1A]/60 text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-4">
                        @{selectedUser.username || 'unknown'}
                        <span className="w-2 h-2 bg-[#1A1A1A]/20 rounded-full" />
                        {selectedUser.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="absolute right-[-40px] top-[-40px] rotate-[15deg] opacity-10">
                  <Zap size={240} strokeWidth={1} />
                </div>
              </div>

              <div className="p-12 space-y-12 flex-1">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "MISSIONS", value: selectedUser.matches_played || 0, icon: Swords, color: "mint" },
                    { label: "EFFICIENCY", value: `${selectedUser.win_rate || 0}%`, icon: TrendingUp, color: "blue" },
                    { label: "TOTAL LOOT", value: `₹${(selectedUser.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy, color: "yellow" },
                    { label: "RESERVES", value: `₹${(selectedUser.balance || 0).toLocaleString()}`, icon: Wallet, color: "pink" },
                  ].map((stat, i) => (
                    <BentoCard key={i} variant={stat.color as any} className="p-8 shadow-xl border-none flex flex-col gap-6 relative overflow-hidden group">
                      <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                        <stat.icon size={24} strokeWidth={3} />
                      </div>
                      <div className="space-y-1 relative z-10">
                        <p className="text-[9px] text-[#1A1A1A]/40 uppercase font-black tracking-[0.2em]">{stat.label}</p>
                        <p className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter">{stat.value}</p>
                      </div>
                    </BentoCard>
                  ))}
                </div>

                <div className="space-y-10">
                  <div>
                    <h4 className="text-[11px] text-[#6B7280] uppercase font-black tracking-[0.4em] ml-4 mb-6">OPERATIVE DOSSIER</h4>
                    <div className="bg-white rounded-[40px] border-4 border-[#F5F5F5] divide-y-4 divide-[#F5F5F5] overflow-hidden shadow-2xl">
                      {[
                        { label: "COMM LINK", value: selectedUser.email, icon: Mail },
                        { label: "SECURE PHONE", value: selectedUser.phone || 'UNVERIFIED', icon: Phone },
                        { label: "ENLISTED", value: new Date(selectedUser.created_at).toLocaleDateString(), icon: Calendar },
                        { label: "LAST SIGNAL", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'OFFLINE', icon: Clock },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-8 hover:bg-[#F9FAFB] transition-colors">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A] shadow-inner border-2 border-[#E5E7EB]">
                              <item.icon size={20} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[12px] font-black text-[#1A1A1A] uppercase truncate max-w-[240px] tracking-tight">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-[#F5F5F5] border-t-4 border-white shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[48px]">
                <div className="grid grid-cols-2 gap-6">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="h-20 rounded-[28px] bg-white border-2 border-[#E5E7EB] text-[#1A1A1A] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 shadow-xl hover:bg-[#F9FAFB] transition-all"
                    onClick={() => handleUpdateUser(selectedUser.id, { status: selectedUser.status === 'Suspended' ? 'Active' : 'Suspended' })}
                  >
                    {updatingId === selectedUser.id ? <Loader2 className="animate-spin" /> : (selectedUser.status === 'Suspended' ? <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={3} /> : <UserMinus size={24} strokeWidth={3} />)} 
                    {selectedUser.status === 'Suspended' ? 'ACTIVATE' : 'SUSPEND'}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="h-20 rounded-[28px] bg-[#1A1A1A] text-white font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all"
                    onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })}
                  >
                    <Ban size={24} strokeWidth={3} className="text-red-500" /> TERMINATE
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminNav />
    </main>
  );
}
