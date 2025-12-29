"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Search, 
  Loader2, 
  Eye, 
  MessageSquare, 
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
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success("User updated successfully");
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

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-bold px-3 py-1 rounded-full border-none shadow-sm";
    switch (status) {
      case 'Active': return <Badge className={`${baseClass} bg-dark-emerald text-white`}>ACTIVE</Badge>;
      case 'Suspended': return <Badge className={`${baseClass} bg-white/10 text-white/40`}>SUSPENDED</Badge>;
      case 'Banned': return <Badge className={`${baseClass} bg-black text-white`}>BANNED</Badge>;
      default: return <Badge className={`${baseClass} bg-white/5 text-white/40`}>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <Badge className="bg-dark-emerald/20 text-dark-emerald border-none text-[8px] tracking-widest px-2">ADMIN</Badge>;
      case 'Organizer': return <Badge className="bg-white/10 text-white border-none text-[8px] tracking-widest px-2">ORGANIZER</Badge>;
      default: return <Badge className="bg-white/5 text-white/40 border-none text-[8px] tracking-widest px-2">PLAYER</Badge>;
    }
  };

    return (
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-mint/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Registry Command</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Warrior<br />
                <span className="text-onyx/20">Registry</span>
              </h1>
            </div>
          </header>
  
          {/* KPI Strip */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Total Recruits", value: stats.total, icon: Users, color: "mint" },
              { label: "Combat Active", value: stats.active, icon: UserCheck, color: "lavender" },
              { label: "Restricted", value: stats.suspended, icon: UserMinus, color: "coral" },
            ].map((stat, i) => (
              <BentoCard key={i} variant="pastel" pastelColor={stat.color as any} className="p-8 flex items-center gap-8 h-[140px] relative overflow-hidden group">
                <div className="w-16 h-16 rounded-[24px] bg-white/60 flex items-center justify-center relative z-10 group-hover:rotate-12 transition-transform duration-500">
                  <stat.icon size={28} className="text-onyx" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-onyx/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tight leading-none">{stat.value.toLocaleString()}</h3>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </BentoCard>
            ))}
          </section>
  
          {/* Filter Bar */}
          <section className="bg-white rounded-[40px] shadow-soft border border-black/[0.02] p-8 flex flex-col lg:flex-row gap-6 relative z-20">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-onyx transition-colors" size={20} />
              <Input 
                className="bg-off-white border-none pl-16 rounded-[24px] h-16 text-[12px] font-black tracking-widest focus-visible:ring-onyx/5 placeholder:text-charcoal/10 uppercase" 
                placeholder="IDENTIFY WARRIOR BY NAME OR CODENAME..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] h-16 rounded-[24px] bg-off-white border-none font-black text-[10px] tracking-[0.2em] text-charcoal/40 uppercase shadow-inner">
                  <SelectValue placeholder="CLEARANCE" />
                </SelectTrigger>
                <SelectContent className="rounded-[32px] border-none bg-white shadow-2xl p-2">
                  <SelectItem value="all" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">ALL CLEARANCE</SelectItem>
                  <SelectItem value="Pro Player" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">WARRIORS</SelectItem>
                  <SelectItem value="Organizer" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">COMMANDERS</SelectItem>
                  <SelectItem value="Admin" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">OVERLORDS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-16 rounded-[24px] bg-off-white border-none font-black text-[10px] tracking-[0.2em] text-charcoal/40 uppercase shadow-inner">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-[32px] border-none bg-white shadow-2xl p-2">
                  <SelectItem value="all" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">ALL SIGNALS</SelectItem>
                  <SelectItem value="Active" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">ACTIVE</SelectItem>
                  <SelectItem value="Suspended" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">RESTRICTED</SelectItem>
                  <SelectItem value="Banned" className="rounded-2xl font-black text-[10px] uppercase tracking-widest py-4">BLACKLISTED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
  
          {/* User List */}
          <section className="space-y-8">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight text-onyx">Personnel Directory</h3>
                <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-[0.4em]">{filteredUsers.length} SIGNALS CLASSIFIED</p>
              </div>
            </div>
  
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white/50 rounded-[48px] border-2 border-dashed border-black/[0.03]">
                <Loader2 className="w-16 h-16 animate-spin text-onyx/10" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-charcoal/20 text-center">Syncing Local Data<br />Chambers...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, idx) => (
                      <motion.div 
                        key={user.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        layout
                        className="bg-white rounded-[40px] p-8 flex items-center justify-between border-none shadow-soft hover:shadow-soft-lg hover:translate-x-2 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-8 relative z-10">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-white bg-off-white shadow-soft overflow-hidden group-hover:scale-110 transition-transform duration-500 ring-1 ring-black/[0.03]">
                              <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white bg-pastel-mint shadow-sm" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h4 className="text-2xl font-black tracking-tight leading-none text-onyx">{user.full_name}</h4>
                              <div className="px-4 py-1.5 bg-onyx text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                {user.status === 'Active' ? 'SYNCED' : user.status.toUpperCase()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-[11px] font-black text-charcoal/30 tracking-[0.15em] uppercase">@{user.username || user.email.split('@')[0]}</p>
                              <div className="w-1.5 h-1.5 rounded-full bg-black/[0.05]" />
                            <span className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest flex items-center gap-2">
                              <Clock size={12} className="opacity-20" /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'OFFLINE'}
                              </span>
                            </div>
                          </div>
                        </div>
  
                        <div className="flex items-center gap-12 relative z-10">
                          <div className="hidden md:flex flex-col items-end text-right">
                            <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-1">Combat Yield</p>
                            <p className="text-[28px] font-black tracking-tight text-onyx leading-none">₹{user.lifetime_earnings?.toLocaleString() || 0}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <motion.button whileTap={{ scale: 0.9 }} className="w-14 h-14 rounded-[22px] bg-off-white flex items-center justify-center text-onyx/20 hover:text-onyx transition-all duration-500 shadow-sm border border-black/[0.01]">
                                  <MoreVertical size={24} />
                                </motion.button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-[32px] border-none w-64 p-3 bg-white shadow-2xl space-y-1">
                                <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-black px-4 py-3">Operations</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                                  className="rounded-2xl flex gap-4 cursor-pointer py-4 px-4 text-[11px] font-black tracking-widest uppercase hover:bg-off-white"
                                >
                                  <Eye size={18} /> View Dossier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-black/[0.03]" />
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateUser(user.id, { role: user.role === 'Admin' ? 'Pro Player' : 'Admin' })}
                                  className="rounded-2xl flex gap-4 cursor-pointer py-4 px-4 text-[11px] font-black tracking-widest uppercase hover:bg-off-white"
                                >
                                  <Shield size={18} /> Modify Clearance
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                  className="rounded-2xl flex gap-4 cursor-pointer py-4 px-4 text-[11px] font-black tracking-widest uppercase hover:bg-off-white"
                                >
                                  <UserMinus size={18} /> {user.status === 'Suspended' ? 'Resume Signal' : 'Restrict Signal'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateUser(user.id, { status: 'Banned' })}
                                  className="rounded-2xl flex gap-4 cursor-pointer py-4 px-4 text-[11px] font-black tracking-widest uppercase text-pastel-coral hover:bg-pastel-coral/10"
                                >
                                  <Ban size={18} /> Blacklist Signal
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="w-14 h-14 rounded-[22px] bg-off-white flex items-center justify-center group-hover:bg-onyx group-hover:text-white transition-all duration-500 shadow-sm border border-black/[0.01]">
                              <ChevronRight size={24} strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-off-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-40 bg-white/50 rounded-[48px] border-2 border-dashed border-black/[0.03] text-center">
                      <div className="w-24 h-24 bg-off-white rounded-[32px] flex items-center justify-center opacity-20 rotate-12 mb-8">
                        <Users size={48} />
                      </div>
                      <p className="text-[14px] font-black uppercase tracking-[0.4em] text-charcoal/40">Signals Undetected</p>
                      <Button variant="link" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }} className="text-onyx font-black mt-4 text-[10px] tracking-[0.3em] uppercase hover:no-underline opacity-40 hover:opacity-100">
                        RESET ALL FILTERS
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
  
        {/* User Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="bg-off-white border-none w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar rounded-l-[48px] shadow-2xl">
            {selectedUser && (
              <div className="flex flex-col h-full">
                <div className="p-12 pb-16 bg-white border-b border-black/[0.02] relative overflow-hidden">
                  <SheetHeader className="relative z-10">
                    <div className="flex justify-between items-center mb-12">
                      <div className="px-6 py-2 bg-onyx text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                        {selectedUser.status === 'Active' ? 'SYNCED' : 'OFFLINE'}
                      </div>
                      <button 
                        onClick={() => setIsDetailOpen(false)} 
                        className="w-14 h-14 bg-off-white hover:bg-white rounded-full flex items-center justify-center transition-all group shadow-sm"
                      >
                        <XCircle size={24} className="group-hover:rotate-90 transition-transform text-onyx/20 group-hover:text-onyx" />
                      </button>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-off-white bg-white shadow-2xl overflow-hidden ring-1 ring-black/[0.03]">
                          <img src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} alt="" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-onyx text-white p-3 rounded-[20px] shadow-2xl border-4 border-off-white rotate-[12deg]">
                          <ShieldCheck size={20} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <SheetTitle className="text-onyx text-[42px] font-black leading-[0.9] tracking-tighter">{selectedUser.full_name}</SheetTitle>
                        <p className="text-charcoal/30 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4">
                          @{selectedUser.username || selectedUser.email.split('@')[0]}
                          <span className="w-1.5 h-1.5 bg-onyx/10 rounded-full" />
                          {selectedUser.role.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-pastel-mint/10 blur-[100px] rounded-full" />
                </div>
  
                <div className="p-12 space-y-16 flex-1">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: "Engagements", value: selectedUser.matches_played || 0, icon: Swords, color: "lavender" },
                      { label: "Efficiency", value: `${selectedUser.win_rate || 0}%`, icon: TrendingUp, color: "mint" },
                      { label: "Total Bounty", value: `₹${(selectedUser.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy, color: "yellow" },
                      { label: "Credit Load", value: `₹${(selectedUser.balance || 0).toLocaleString()}`, icon: Wallet, color: "coral" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-8 rounded-[40px] shadow-soft border border-black/[0.01] flex flex-col gap-6 group hover:shadow-soft-lg transition-all duration-500">
                        <div className={cn(
                          "w-14 h-14 rounded-[22px] flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-sm",
                          `bg-pastel-${stat.color}`
                        )}>
                          <stat.icon size={24} className="text-onyx" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-charcoal/30 uppercase font-black tracking-[0.2em]">{stat.label}</p>
                          <p className="text-3xl font-black text-onyx tracking-tighter">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  {/* Information Sections */}
                  <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-charcoal/30 uppercase tracking-[0.4em] ml-2">Mission Dossier</h4>
                      <div className="bg-white rounded-[40px] overflow-hidden divide-y divide-black/[0.02] shadow-soft border border-black/[0.01]">
                        {[
                          { label: "Signal Contact", value: selectedUser.email, icon: Mail },
                          { label: "Linked Comms", value: selectedUser.phone || 'UNAVAILABLE', icon: Phone },
                          { label: "Deployment Zone", value: selectedUser.country || 'INDIA', icon: Globe },
                          { label: "Recruitment Log", value: new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: Calendar },
                          { label: "Last Transmission", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'N/A', icon: Clock },
                        ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-8 hover:bg-off-white transition-colors group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-[18px] bg-off-white flex items-center justify-center text-onyx/20 border border-black/[0.01] group-hover:bg-white group-hover:text-onyx transition-all shadow-sm">
                              <item.icon size={20} />
                            </div>
                            <span className="text-[10px] text-charcoal/40 font-black uppercase tracking-[0.2em]">{item.label}</span>
                          </div>
                          <span className="text-[13px] font-black text-onyx tracking-tight text-right max-w-[220px] truncate">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
  
                {/* Admin Actions Footer */}
                <div className="p-12 bg-white border-t border-black/[0.02] shadow-2xl relative z-20">
                  <div className="grid grid-cols-2 gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="h-20 rounded-[28px] bg-off-white text-onyx font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-black/[0.03] transition-all border border-black/[0.01] shadow-sm"
                      onClick={() => toast.info("Security scan protocol initialized...")}
                    >
                      <Zap size={20} className="text-onyx/20 group-hover:text-onyx" /> SYSTEM SCAN
                    </motion.button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          disabled={updatingId !== null}
                          className="h-20 rounded-[28px] bg-onyx text-white font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 shadow-2xl hover:bg-carbon-black transition-all"
                        >
                          {updatingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} className="text-pastel-mint" />}
                          MANAGEMENT
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72 rounded-[40px] p-4 border-none shadow-2xl bg-white space-y-2">
                        <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Active' })} className="rounded-[24px] py-5 px-6 text-[11px] font-black tracking-widest uppercase hover:bg-off-white flex items-center gap-4">
                          <CheckCircle2 size={20} className="text-pastel-mint" /> Resync Signal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Suspended' })} className="rounded-[24px] py-5 px-6 text-[11px] font-black tracking-widest uppercase hover:bg-off-white flex items-center gap-4">
                          <UserMinus size={20} className="text-charcoal/30" /> Restrict Signal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black/[0.03]" />
                        <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })} className="rounded-[24px] py-5 px-6 text-[11px] font-black tracking-widest uppercase text-pastel-coral hover:bg-pastel-coral/10 flex items-center gap-4">
                          <XCircle size={20} /> Blacklist User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
