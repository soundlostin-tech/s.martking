"use client";

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
      case 'Active': return <Badge className={`${baseClass} bg-light-coral text-white`}>ACTIVE</Badge>;
      case 'Suspended': return <Badge className={`${baseClass} bg-white/10 text-white/40`}>SUSPENDED</Badge>;
      case 'Banned': return <Badge className={`${baseClass} bg-black text-white`}>BANNED</Badge>;
      default: return <Badge className={`${baseClass} bg-white/5 text-white/40`}>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <Badge className="bg-light-coral/20 text-light-coral border-none text-[8px] tracking-widest px-2">ADMIN</Badge>;
      case 'Organizer': return <Badge className="bg-white/10 text-white border-none text-[8px] tracking-widest px-2">ORGANIZER</Badge>;
      default: return <Badge className="bg-white/5 text-white/40 border-none text-[8px] tracking-widest px-2">PLAYER</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-32 bg-yale-blue bg-[radial-gradient(circle_at_50%_0%,_#355070_0%,_#304966_100%)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-light-coral/10 rounded-full blur-[120px]" />
      </div>

      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-light-coral uppercase tracking-[0.4em]">Registry Command</h4>
          <h1 className="text-4xl font-heading text-white">Warrior <span className="italic font-serif text-white/60">Registry</span></h1>
        </div>

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
              className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-3xl font-heading text-white">{stat.value.toLocaleString()}</h3>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{stat.sub}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 text-light-coral group-hover:scale-110 transition-transform duration-500">
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-[60px]" />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <Input 
              className="bg-white/5 border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-light-coral placeholder:text-white/20 text-white" 
              placeholder="SEARCH BY NAME, USERNAME, OR EMAIL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-white/5 border-none font-bold text-[10px] tracking-widest text-white">
                <SelectValue placeholder="ROLE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-dusk-blue text-white">
                <SelectItem value="all">ALL ROLES</SelectItem>
                <SelectItem value="Pro Player">PLAYER</SelectItem>
                <SelectItem value="Organizer">ORGANIZER</SelectItem>
                <SelectItem value="Admin">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-white/5 border-none font-bold text-[10px] tracking-widest text-white">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 bg-dusk-blue text-white">
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
              <h3 className="text-2xl font-heading text-white">Arena <span className="italic font-serif text-white/60">Directory</span></h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{filteredUsers.length} MEMBERS FOUND</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10">
              <Loader2 className="w-12 h-12 animate-spin text-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Accessing Data Chambers...</p>
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
                      className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 flex items-center justify-between border border-white/10 hover:border-light-coral/30 hover:bg-white/[0.08] transition-all duration-500 group cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <Avatar className="w-16 h-16 border-2 border-white/10 shadow-xl transition-transform duration-500 group-hover:scale-110">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-light-coral text-white font-heading text-lg">
                            {user.full_name?.substring(0, 2).toUpperCase() || "SK"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-heading text-white leading-none">{user.full_name}</h4>
                            {getStatusBadge(user.status)}
                          </div>
                          <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">@{user.username || user.email.split('@')[0]}</p>
                          <div className="flex items-center gap-3">
                            {getRoleBadge(user.role)}
                            <span className="text-[9px] text-white/20 flex items-center gap-1 font-bold uppercase tracking-widest">
                              <Clock size={10} strokeWidth={3} /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'NEVER'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end mr-8 text-right">
                          <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.2em]">Earnings</p>
                          <p className="text-lg font-heading text-white">₹{user.lifetime_earnings?.toLocaleString() || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-white/10">
                                <MoreVertical size={20} className="text-white/20" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[1.5rem] border-white/10 w-52 p-2 bg-dusk-blue text-white shadow-2xl">
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold px-3 py-2">ACTIONS</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide hover:bg-white/10"
                              >
                                <Eye size={16} /> VIEW PROFILE
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5" />
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold px-3 py-2">MANAGEMENT</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { role: user.role === 'Admin' ? 'Pro Player' : 'Admin' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide hover:bg-white/10"
                              >
                                <Shield size={16} /> CHANGE ROLE
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide hover:bg-white/10"
                              >
                                <UserMinus size={16} /> {user.status === 'Suspended' ? 'UNSUSPEND' : 'SUSPEND'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: 'Banned' })}
                                className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide text-red-400 focus:text-red-400 focus:bg-red-900/20"
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
                  <div className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-dashed border-white/10 text-center">
                    <Users size={64} strokeWidth={1} className="text-white/5 mb-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">No matching warriors found</p>
                    <Button variant="link" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }} className="text-light-coral font-bold mt-4 text-[10px] tracking-widest uppercase">
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
        <SheetContent className="bg-yale-blue border-white/10 w-full sm:max-w-xl p-0 overflow-y-auto no-scrollbar text-white">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <div className="p-10 bg-dusk-blue border-b border-white/10 relative overflow-hidden">
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
                      <AvatarFallback className="bg-yale-blue text-white text-3xl font-heading">
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
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-light-coral/20 blur-[100px] rounded-full" />
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
                    <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 text-light-coral flex items-center justify-center">
                        <stat.icon size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-heading text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Information Sections */}
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] text-white/20 uppercase font-bold tracking-[0.3em] ml-2 mb-4">ACCOUNT DOSSIER</h4>
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
                      {[
                        { label: "Email Address", value: selectedUser.email, icon: Mail },
                        { label: "Phone Number", value: selectedUser.phone || 'NOT VERIFIED', icon: Phone },
                        { label: "Region / Country", value: selectedUser.country || 'INDIA', icon: Globe },
                        { label: "Member Since", value: new Date(selectedUser.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }), icon: Calendar },
                        { label: "Last Active", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'N/A', icon: Clock },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                              <item.icon size={18} />
                            </div>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-white uppercase tracking-wide text-right max-w-[200px]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions Footer */}
              <div className="p-10 bg-dusk-blue border-t border-white/10 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className="h-16 rounded-[2rem] border-white/10 bg-white/5 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-white/10"
                    onClick={() => toast.info("Security scan protocol initialized...")}
                  >
                    <Zap size={20} fill="currentColor" /> SECURITY RESET
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={updatingId !== null}
                        className="h-16 rounded-[2rem] bg-light-coral hover:bg-light-coral/80 text-white font-bold uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl shadow-light-coral/20 border-none"
                      >
                        {updatingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        MANAGE ACCESS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 border-white/10 shadow-2xl bg-dusk-blue text-white">
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Active' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10">
                        <CheckCircle2 size={16} className="mr-3 text-light-coral" /> MARK AS ACTIVE
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Suspended' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10">
                        <UserMinus size={16} className="mr-3 text-white/40" /> SUSPEND ACCESS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })} className="rounded-xl py-4 px-4 text-[10px] font-bold tracking-widest uppercase text-red-400 focus:text-red-400 focus:bg-red-900/20">
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
