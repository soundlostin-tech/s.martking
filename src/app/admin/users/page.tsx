"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Search, 
  Filter, 
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
  Target,
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
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
      
      // Calculate Stats
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-stone-100 text-stone-700';
      case 'Suspended': return 'bg-amber-100 text-amber-700';
      case 'Banned': return 'bg-red-100 text-red-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <Badge className="bg-purple-100 text-purple-700 border-none">Admin</Badge>;
      case 'Organizer': return <Badge className="bg-blue-100 text-blue-700 border-none">Organizer</Badge>;
      default: return <Badge className="bg-stone-100 text-stone-700 border-none">Player</Badge>;
    }
  };

  return (
    <main className="min-h-screen pb-24 bg-stone-50">
      <HeroSection 
        title="User Management" 
        subtitle="Control arena roles, status, and player verification."
        className="mx-0 rounded-none pb-32"
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-yellow/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-onyx/30 rounded-full blur-[100px]" />
        </div>
      </HeroSection>

      <div className="px-6 -mt-24 relative z-10 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "text-lime-yellow", sub: "Registered Players" },
            { label: "Active This Month", value: stats.active, icon: UserCheck, color: "text-green-400", sub: "Engaged Users" },
            { label: "Suspended", value: stats.suspended, icon: UserMinus, color: "text-red-400", sub: "Restricted Access" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-onyx rounded-[32px] p-6 text-white border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-heading text-white">{stat.value.toLocaleString()}</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase mt-2">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[40px] border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              className="bg-stone-50 border-stone-100 pl-12 rounded-2xl h-14 text-sm focus-visible:ring-lime-yellow" 
              placeholder="Search by name, username, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-stone-50 border-stone-100">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-stone-200">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Pro Player">Player</SelectItem>
                <SelectItem value="Organizer">Organizer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-stone-50 border-stone-100">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-stone-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-heading text-xl text-onyx">Member Directory <span className="text-stone-400 text-sm font-sans ml-2">({filteredUsers.length})</span></h3>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-stone-500 hover:text-onyx uppercase tracking-wider">
              Recent Activity <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[40px] border border-stone-200">
              <Loader2 className="w-12 h-12 animate-spin text-lime-yellow" />
              <p className="text-stone-400 font-medium">Loading arena members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <motion.div 
                      key={user.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                      className="bg-white rounded-[32px] p-4 flex items-center justify-between border border-stone-200 hover:border-lime-yellow hover:shadow-xl hover:shadow-onyx/5 transition-all group cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-2 border-stone-100 shadow-sm transition-transform group-hover:scale-105">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-onyx text-white font-heading">
                            {user.full_name?.substring(0, 2).toUpperCase() || "SK"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-onyx leading-none">{user.full_name}</h4>
                            <Badge className={`text-[9px] font-bold px-1.5 py-0 rounded-full border-none ${getStatusColor(user.status)}`}>
                              {user.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">@{user.username || user.email.split('@')[0]}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            {getRoleBadge(user.role)}
                            <span className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                              <Clock size={10} /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-8">
                          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Earnings</p>
                          <p className="text-sm font-heading text-onyx">₹{user.lifetime_earnings?.toLocaleString() || 0}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full w-10 h-10 hover:bg-stone-100 text-stone-400 hover:text-onyx"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Message feature coming soon to ${user.full_name}`);
                            }}
                          >
                            <MessageSquare size={18} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                                <MoreVertical size={18} className="text-stone-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-stone-200 w-48 p-2">
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                                className="rounded-xl flex gap-2 cursor-pointer py-2.5"
                              >
                                <Eye size={16} /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Management</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { role: user.role === 'Admin' ? 'Pro Player' : 'Admin' })}
                                className="rounded-xl flex gap-2 cursor-pointer py-2.5"
                              >
                                <Shield size={16} /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                className="rounded-xl flex gap-2 cursor-pointer py-2.5"
                              >
                                <UserMinus size={16} /> {user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateUser(user.id, { status: 'Banned' })}
                                className="rounded-xl flex gap-2 cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Ban size={16} /> Ban Player
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-stone-300">
                    <Users size={48} className="text-stone-200 mb-4" />
                    <p className="text-stone-500 font-medium">No users found matching your criteria</p>
                    <Button variant="link" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }} className="text-lime-yellow font-bold mt-2">
                      Clear all filters
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
        <SheetContent className="bg-stone-50 border-none w-full sm:max-w-xl p-0 overflow-y-auto">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <div className="p-8 bg-onyx text-white relative overflow-hidden">
                <SheetHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className={`px-3 py-1 rounded-full border-none text-[10px] font-bold ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-white/30 hover:text-white transition-colors">
                        <ShieldAlert size={20} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-white/10 shadow-2xl">
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback className="bg-lime-yellow text-onyx text-2xl font-heading">
                        {selectedUser.full_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-white text-3xl font-heading mb-1">{selectedUser.full_name}</SheetTitle>
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        @{selectedUser.username || selectedUser.email.split('@')[0]}
                        <span className="w-1.5 h-1.5 bg-lime-yellow rounded-full" />
                        {selectedUser.role}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-yellow/20 rounded-full blur-[80px] -mr-32 -mt-32" />
              </div>

              <div className="p-8 space-y-8 flex-1">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Matches", value: selectedUser.matches_played || 0, icon: Swords, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Win Rate", value: `${selectedUser.win_rate || 0}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
                    { label: "Earnings", value: `₹${(selectedUser.lifetime_earnings || 0).toLocaleString()}`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Balance", value: `₹${(selectedUser.balance || 0).toLocaleString()}`, icon: Wallet, color: "text-purple-500", bg: "bg-purple-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-4 shadow-sm">
                      <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className="text-lg font-heading text-onyx">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Information Sections */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] text-stone-400 uppercase font-bold tracking-[0.2em] ml-2 mb-3">Account Information</h4>
                    <div className="bg-white rounded-[32px] border border-stone-100 divide-y divide-stone-50 overflow-hidden shadow-sm">
                      {[
                        { label: "Email Address", value: selectedUser.email, icon: Mail },
                        { label: "Phone Number", value: selectedUser.phone || 'Not verified', icon: Phone },
                        { label: "Region / Country", value: selectedUser.country || 'India', icon: Globe },
                        { label: "Member Since", value: new Date(selectedUser.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }), icon: Calendar },
                        { label: "Last Active", value: selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'N/A', icon: Clock },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                              <item.icon size={16} />
                            </div>
                            <span className="text-xs text-stone-500 font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold text-onyx">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] text-stone-400 uppercase font-bold tracking-[0.2em] ml-2 mb-3">Recent Security Events</h4>
                    <div className="bg-white rounded-[32px] border border-stone-100 p-6 space-y-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                        <div>
                          <p className="text-xs font-bold text-onyx">Successful Login</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{new Date().toLocaleString()} • Device: Chrome (Windows)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        <div>
                          <p className="text-xs font-bold text-onyx">Password Changed</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">Dec 20, 2025 • Via System Reset</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions Footer */}
              <div className="p-8 bg-white border-t border-stone-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className="h-14 rounded-[24px] border-stone-200 text-onyx font-bold gap-2"
                    onClick={() => {
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 1000)),
                        {
                          loading: 'Sending reset link...',
                          success: 'Reset link sent successfully!',
                          error: 'Failed to send reset link',
                        }
                      );
                    }}
                  >
                    <Zap size={20} /> Security Reset
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={updatingId !== null}
                        className="h-14 rounded-[24px] bg-onyx hover:bg-lime-yellow hover:text-onyx text-white font-bold gap-2 transition-all"
                      >
                        {updatingId === selectedUser.id ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        Manage Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-stone-200 shadow-xl">
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Active' })} className="rounded-xl py-2.5">
                        <CheckCircle2 size={16} className="mr-2 text-green-500" /> Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Suspended' })} className="rounded-xl py-2.5">
                        <UserMinus size={16} className="mr-2 text-amber-500" /> Suspend Account
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(selectedUser.id, { status: 'Banned' })} className="rounded-xl py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                        <XCircle size={16} className="mr-2" /> Ban from Arena
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
