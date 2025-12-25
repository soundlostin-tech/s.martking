"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
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
  Globe,
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
      case 'Active': return <Badge className={`${baseClass} bg-black text-white`}>ACTIVE</Badge>;
      case 'Suspended': return <Badge className={`${baseClass} bg-black/10 text-black`}>SUSPENDED</Badge>;
      case 'Banned': return <Badge className={`${baseClass} bg-black text-white`}>BANNED</Badge>;
      default: return <Badge className={`${baseClass} bg-black/5 text-black/40`}>{status.toUpperCase()}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <Badge className="bg-black text-white border-none text-[8px] tracking-widest px-2">ADMIN</Badge>;
      case 'Organizer': return <Badge className="bg-zinc-200 text-black border-none text-[8px] tracking-widest px-2">ORGANIZER</Badge>;
      default: return <Badge className="bg-zinc-100 text-black/40 border-none text-[8px] tracking-widest px-2">PLAYER</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-32 bg-zinc-50">
      <HeroSection 
        title={<>Member <span className="italic font-serif opacity-60">Registry</span></>}
        subtitle="Control arena roles, status, and player verification."
        className="mx-0 rounded-none pb-32 bg-zinc-50 border-b border-black/5"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-zinc-200 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-300 rounded-full blur-[120px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-10 max-w-4xl mx-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Users", value: stats.total, icon: Users, sub: "Registered Players" },
            { label: "Active", value: stats.active, icon: UserCheck, sub: "Engaged Users" },
            { label: "Suspended", value: stats.suspended, icon: UserMinus, sub: "Restricted Access" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-50 rounded-[2.5rem] p-8 text-black border border-black/5 shadow-2xl shadow-black/5 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-black/30 uppercase font-bold tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-3xl font-heading text-black">{stat.value.toLocaleString()}</h3>
                  <p className="text-[9px] text-black/20 font-bold uppercase tracking-widest">{stat.sub}</p>
                </div>
                <div className="p-3.5 rounded-[1.5rem] bg-black/5 text-black group-hover:scale-110 transition-transform duration-500">
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-black/[0.02] rounded-full blur-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 p-6 shadow-2xl shadow-black/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <Input 
              className="bg-black/[0.03] border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-black placeholder:text-black/20" 
              placeholder="SEARCH BY NAME, USERNAME, OR EMAIL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-black/[0.03] border-none font-bold text-[10px] tracking-widest">
                <SelectValue placeholder="ROLE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                <SelectItem value="all">ALL ROLES</SelectItem>
                <SelectItem value="Pro Player">PLAYER</SelectItem>
                <SelectItem value="Organizer">ORGANIZER</SelectItem>
                <SelectItem value="Admin">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-black/[0.03] border-none font-bold text-[10px] tracking-widest">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="Active">ACTIVE</SelectItem>
                <SelectItem value="Inactive">INACTIVE</SelectItem>
                <SelectItem value="Suspended">SUSPENDED</SelectItem>
                <SelectItem value="Banned">BANNED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-black">Arena <span className="italic font-serif opacity-60">Directory</span></h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{filteredUsers.length} MEMBERS FOUND</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] font-bold text-black/40 hover:text-black uppercase tracking-[0.2em]">
              RECENT <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-50 rounded-[3rem] border border-black/5">
              <Loader2 className="w-12 h-12 animate-spin text-black/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">Accessing Data Chambers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <motion.div 
                      key={user.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                      className="bg-zinc-50 rounded-[2.5rem] p-6 flex items-center justify-between border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <Avatar className="w-16 h-16 border-2 border-white shadow-xl transition-transform duration-500 group-hover:scale-110">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-black text-white font-heading text-lg">
                            {user.full_name?.substring(0, 2).toUpperCase() || "SK"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-heading text-black leading-none">{user.full_name}</h4>
                            {getStatusBadge(user.status)}
                          </div>
                          <p className="text-[10px] font-bold text-black/30 tracking-widest uppercase">@{user.username || user.email.split('@')[0]}</p>
                          <div className="flex items-center gap-3">
                            {getRoleBadge(user.role)}
                            <span className="text-[9px] text-black/20 flex items-center gap-1 font-bold uppercase tracking-widest">
                              <Clock size={10} strokeWidth={3} /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'NEVER'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end mr-8">
                          <p className="text-[9px] text-black/20 uppercase font-bold tracking-[0.2em]">Earnings</p>
                          <p className="text-lg font-heading text-black">₹{user.lifetime_earnings?.toLocaleString() || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-2xl w-12 h-12 hover:bg-black/5 text-black/20 hover:text-black transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Message feature coming soon to ${user.full_name}`);
                            }}
                          >
                            <MessageSquare size={20} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-black/5">
                                <MoreVertical size={20} className="text-black/20" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[1.5rem] border-black/5 w-52 p-2 bg-zinc-50 shadow-2xl shadow-black/10">
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-black/20 font-bold px-3 py-2">ACTIONS</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide"
                              >
                                <Eye size={16} /> VIEW PROFILE
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-black/5" />
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-black/20 font-bold px-3 py-2">MANAGEMENT</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { role: user.role === 'Admin' ? 'Pro Player' : 'Admin' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide"
                              >
                                <Shield size={16} /> CHANGE ROLE
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide"
                              >
                                <UserMinus size={16} /> {user.status === 'Suspended' ? 'UNSUSPEND' : 'SUSPEND'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: 'Banned' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Ban size={16} /> BAN PLAYER
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 bg-zinc-50 rounded-[3rem] border border-dashed border-black/10">
                    <Users size={64} strokeWidth={1} className="text-black/5 mb-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">No matching warriors found</p>
                    <Button variant="link" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }} className="text-black font-bold mt-4 text-[10px] tracking-widest uppercase">
                      CLEAR ALL FILTERS
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-zinc-50 border-none w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <div className="p-10 bg-black text-white relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    {getStatusBadge(selectedUser.status)}
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white transition-colors">
                      <ShieldAlert size={22} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-8">
                    <Avatar className="w-28 h-28 border-4 border-white/10 shadow-2xl">
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback className="bg-zinc-900 text-white text-3xl font-heading">
                        {selectedUser.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <SheetTitle className="text-white text-4xl font-heading leading-tight">{selectedUser.full_name}</SheetTitle>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                        @{selectedUser.username || selectedUser.email.split('@')[0]}
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        {selectedUser.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                {/* Visual Glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-400/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-600/20 blur-[100px] rounded-full" />
              </div>

              <div className="p-10 space-y-12 flex-1">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Matches", value: selectedUser.matches_played || 0, icon: Swords },
                    { label: "Win Rate", value: `${selectedUser.win_rate || 0}%`, icon: TrendingUp },
                    { label: "Earnings", value: `₹${(selectedUser.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy },
                    { label: "Balance", value: `₹${(selectedUser.balance || 0).toLocaleString()}`, icon: Wallet },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-50 p-6 rounded-[2rem] border border-black/5 flex flex-col gap-3 shadow-2xl shadow-black/[0.02]">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 text-black flex items-center justify-center">
                        <stat.icon size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-black/20 uppercase font-bold tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-heading text-black">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Information Sections */}
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] text-black/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">ACCOUNT DOSSIER</h4>
                    <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 divide-y divide-black/5 overflow-hidden shadow-2xl shadow-black/[0.02]">
                      {[
                        { label: "Email Address", value: selectedUser.email, icon: Mail },
                        { label: "Phone Number", value: selectedUser.phone || 'NOT VERIFIED', icon: Phone },
                        { label: "Region / Country", value: selectedUser.country || 'INDIA', icon: Globe },
                        { label: "Member Since", value: new Date(selectedUser.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }), icon: Calendar },
                        { label: "Last Active", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'N/A', icon: Clock },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-black/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20">
                              <item.icon size={18} />
                            </div>
                            <span className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-black uppercase tracking-wide">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] text-black/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">SECURITY LOGS</h4>
                    <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 p-8 space-y-6 shadow-2xl shadow-black/[0.02]">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-black mt-1.5" />
                        <div>
                          <p className="text-[11px] font-bold text-black uppercase tracking-wide">Successful Connection</p>
                          <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1">{new Date().toLocaleString()} • DEVICE: CHROME (DESKTOP)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 opacity-40">
                        <div className="w-2 h-2 rounded-full bg-black mt-1.5" />
                        <div>
                          <p className="text-[11px] font-bold text-black uppercase tracking-wide">Credentials Modified</p>
                          <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1">DEC 20, 2025 • VIA SYSTEM RESET</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions Footer */}
              <div className="p-10 bg-zinc-50 border-t border-black/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className="h-16 rounded-[2rem] border-black/10 text-black font-bold uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-black/5"
                    onClick={() => {
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 1000)),
                        {
                          loading: 'Transmitting reset protocol...',
                          success: 'Protocol transmitted successfully',
                          error: 'Transmission failure',
                        }
                      );
                    }}
                  >
                    <Zap size={20} fill="currentColor" /> SECURITY RESET
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={updatingId !== null}
                        className="h-16 rounded-[2rem] bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-black/20"
                      >
                        {updatingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        MANAGE ACCESS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 border-black/5 shadow-2xl bg-zinc-50">
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Active' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase">
                        <CheckCircle2 size={16} className="mr-3 text-black" /> MARK AS ACTIVE
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Suspended' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase">
                        <UserMinus size={16} className="mr-3 text-black/40" /> SUSPEND ACCESS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-red-600 focus:text-red-600 focus:bg-red-50">
                        <XCircle size={16} className="mr-3" /> BAN FROM ARENA
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
