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
  XCircle
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

      // Log to audit_logs
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
    <main className="min-h-screen p-8 lg:p-12 space-y-12 bg-background">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 blob-header blob-header-sky">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] mb-2">Registry Command</p>
          <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-onyx">
            Warriors <br />
            <span className="text-charcoal-brown/40">Player Database</span>
          </h1>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BentoCard variant="vibrant" className="p-8 h-44 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest mb-4">Total Population</p>
            <h3 className="text-4xl font-heading font-black text-onyx">{stats.total.toLocaleString()}</h3>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] rotate-[-15deg] opacity-5 pointer-events-none">
            <Users size={100} />
          </div>
        </BentoCard>

        <BentoCard variant="dark" className="p-8 h-44 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Active Deployments</p>
            <h3 className="text-4xl font-heading font-black text-white">{stats.active.toLocaleString()}</h3>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] rotate-[15deg] opacity-5 pointer-events-none">
            <UserCheck size={100} />
          </div>
        </BentoCard>

        <BentoCard variant="pastel" pastelColor="coral" className="p-8 h-44 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-onyx/40 uppercase tracking-widest mb-4">Restricted Access</p>
            <h3 className="text-4xl font-heading font-black text-onyx">{stats.suspended.toLocaleString()}</h3>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] rotate-[-5deg] opacity-5 pointer-events-none">
            <ShieldAlert size={100} />
          </div>
        </BentoCard>
      </section>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-onyx text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8"
          >
            <p className="text-[10px] font-black uppercase tracking-widest">
              {selectedUserIds.length} Warriors Selected
            </p>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                onClick={() => handleBulkAction('Active')}
              >
                Activate
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest text-pastel-coral hover:bg-white/10"
                onClick={() => handleBulkAction('Suspended')}
              >
                Suspend
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-white/10"
                onClick={() => handleBulkAction('Banned')}
              >
                Ban
              </Button>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
              onClick={() => setSelectedUserIds([])}
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <section className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-black/5">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30" size={20} />
          <Input 
            className="bg-background border-none pl-14 rounded-2xl h-14 text-sm font-bold focus-visible:ring-onyx placeholder:text-charcoal/30 text-onyx" 
            placeholder="Search Registry..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 px-4 h-14 bg-background rounded-2xl border-none">
              <Checkbox 
                checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUserIds(filteredUsers.map(u => u.id));
                  } else {
                    setSelectedUserIds([]);
                  }
                }}
              />
              <span className="text-[10px] font-black tracking-widest text-charcoal/60 uppercase">ALL</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-background border-none font-black text-[10px] tracking-widest text-charcoal/60">
                <SelectValue placeholder="SORT BY" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="newest" className="text-[10px] font-black">NEWEST</SelectItem>
                <SelectItem value="balance" className="text-[10px] font-black">BALANCE</SelectItem>
                <SelectItem value="winrate" className="text-[10px] font-black">WIN RATE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-background border-none font-black text-[10px] tracking-widest text-charcoal/60">
              <SelectValue placeholder="ROLE" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-black">ALL ROLES</SelectItem>
              <SelectItem value="Pro Player" className="text-[10px] font-black">PLAYER</SelectItem>
              <SelectItem value="Admin" className="text-[10px] font-black">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-background border-none font-black text-[10px] tracking-widest text-charcoal/60">
              <SelectValue placeholder="STATUS" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-black">ALL STATUS</SelectItem>
              <SelectItem value="Active" className="text-[10px] font-black">ACTIVE</SelectItem>
              <SelectItem value="Suspended" className="text-[10px] font-black">SUSPENDED</SelectItem>
              <SelectItem value="Banned" className="text-[10px] font-black">BANNED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* User Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Querying Database...</p>
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
                    className="p-8 border-none shadow-sm cursor-pointer group hover:shadow-xl transition-all relative"
                    onClick={() => { setSelectedUser(u); setIsDetailOpen(true); }}
                  >
                    <div 
                      className="absolute top-4 left-4 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox 
                        checked={selectedUserIds.includes(u.id)}
                        onCheckedChange={() => toggleUserSelection(u.id)}
                      />
                    </div>
                    <div className="flex justify-between items-start mb-8">
                      <Avatar className="w-20 h-20 border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback className="bg-lime-yellow text-onyx text-2xl font-heading font-black">
                        {u.full_name?.substring(0, 2).toUpperCase() || "SK"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge variant={u.status === 'Active' ? 'completed' : u.status === 'Suspended' ? 'pending' : 'failed'} className="px-3 py-1 text-[8px]" />
                      <div className="px-2 py-0.5 bg-onyx/5 rounded-md">
                        <span className="text-[8px] font-black uppercase tracking-widest text-charcoal/40">{u.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <h4 className="text-xl font-heading font-black text-onyx leading-tight group-hover:text-charcoal-brown transition-colors">{u.full_name}</h4>
                    <p className="text-[10px] font-bold text-charcoal/40 tracking-[0.2em] uppercase">@{u.username || u.email.split('@')[0]}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-onyx/5">
                    <div>
                      <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Lifetime Earnings</p>
                      <p className="text-sm font-black text-onyx">₹{u.lifetime_earnings?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Win Rate</p>
                      <p className="text-sm font-black text-onyx">{u.win_rate || 0}%</p>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] shadow-sm flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-off-white flex items-center justify-center">
              <Zap size={48} strokeWidth={1} className="text-charcoal/20" />
            </div>
            <h3 className="text-2xl font-heading text-onyx font-black">No Warriors Classified</h3>
            <Button variant="link" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }} className="text-onyx font-black text-[10px] tracking-widest uppercase underline underline-offset-8">
              Reset Registry Scan
            </Button>
          </div>
        )}
      </section>

      {/* User Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-white border-none w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar text-onyx">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <div className="p-10 bg-lime-yellow relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <StatusBadge variant={selectedUser.status === 'Active' ? 'completed' : 'failed'} className="bg-onyx text-white shadow-none" />
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/40 text-onyx">
                      <ShieldCheck size={24} strokeWidth={3} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-8">
                    <Avatar className="w-32 h-32 border-8 border-white/20 shadow-2xl">
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback className="bg-onyx text-lime-yellow text-4xl font-heading font-black">
                        {selectedUser.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <SheetTitle className="text-onyx text-4xl font-heading font-black leading-tight">{selectedUser.full_name}</SheetTitle>
                      <p className="text-onyx/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                        @{selectedUser.username || selectedUser.email.split('@')[0]}
                        <span className="w-1 h-1 bg-onyx/20 rounded-full" />
                        {selectedUser.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="absolute right-[-40px] top-[-40px] rotate-[15deg] opacity-10">
                  <Zap size={240} strokeWidth={1} />
                </div>
              </div>

              <div className="p-10 space-y-12 flex-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Matches", value: selectedUser.matches_played || 0, icon: Swords, color: "mint" },
                    { label: "Win Rate", value: `${selectedUser.win_rate || 0}%`, icon: TrendingUp, color: "sky" },
                    { label: "Earnings", value: `₹${(selectedUser.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy, color: "yellow" },
                    { label: "Balance", value: `₹${(selectedUser.balance || 0).toLocaleString()}`, icon: Wallet, color: "peach" },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-pastel-${stat.color}/20 p-8 rounded-[32px] border-none flex flex-col gap-4`}>
                      <div className={`w-12 h-12 rounded-2xl bg-pastel-${stat.color} flex items-center justify-center text-onyx shadow-inner`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-charcoal/40 uppercase font-black tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-heading text-onyx font-black">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Account Details */}
                <div className="space-y-8">
                  <h4 className="text-[10px] text-charcoal/40 uppercase font-black tracking-[0.3em] ml-2">Account Dossier</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Email", value: selectedUser.email, icon: Mail },
                      { label: "Phone", value: selectedUser.phone || 'UNVERIFIED', icon: Phone },
                      { label: "Member Since", value: new Date(selectedUser.created_at).toLocaleDateString(), icon: Calendar },
                      { label: "Last Active", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'N/A', icon: Clock },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-background rounded-2xl border border-black/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-charcoal/40 shadow-sm">
                            <item.icon size={18} strokeWidth={2.5} />
                          </div>
                          <span className="text-[10px] text-charcoal/40 font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-black text-onyx uppercase truncate max-w-[200px]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-10 bg-background border-t border-black/5">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className="h-20 rounded-[32px] border-none bg-white text-onyx font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-sm hover:bg-white/80 transition-all"
                    onClick={() => handleUpdateUser(selectedUser.id, { status: selectedUser.status === 'Suspended' ? 'Active' : 'Suspended' })}
                  >
                    {updatingId === selectedUser.id ? <Loader2 className="animate-spin" /> : <UserMinus size={20} strokeWidth={3} />} 
                    {selectedUser.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                  </Button>
                  <Button 
                    className="h-20 rounded-[32px] bg-onyx text-white font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-2xl shadow-onyx/20 border-none"
                    onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })}
                  >
                    <Ban size={20} strokeWidth={3} className="text-pastel-coral" /> BAN WARRIOR
                  </Button>
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
