"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Ban, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newToday: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        total: data?.length || 0,
        active: data?.length || 0, // Simplified
        newToday: data?.filter(u => new Date(u.created_at) >= today).length || 0
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Users" 
        subtitle="Manage arena players and staff."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10 flex flex-col gap-6">
        <div className="bg-white rounded-[32px] p-6 shadow-xl border border-stone-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total</p>
              <p className="text-xl font-heading">{stats.total}</p>
            </div>
            <div className="text-center border-x border-stone-100">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Active</p>
              <p className="text-xl font-heading text-olive">{stats.active}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">New Today</p>
              <p className="text-xl font-heading text-lemon-lime">{stats.newToday}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <Input 
            className="bg-white border-stone-200 pl-12 rounded-full h-12 shadow-sm" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border border-stone-100">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-sm">{user.full_name}</h4>
                        <p className="text-[10px] text-stone-500">{user.phone}</p>
                      </div>
                    </div>
                    <Badge className="text-[8px] h-4 rounded-full border-none bg-lime-yellow/20 text-olive">
                      ACTIVE
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                    <Badge className="bg-stone-100 text-stone-500 border-none text-[9px]">PLAYER</Badge>
                    <div className="flex gap-2">
                      <button className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-onyx transition-all">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-onyx transition-all">
                        <MessageSquare size={16} />
                      </button>
                      <button className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-red-500 transition-all">
                        <Ban size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-500 py-12">No users found</p>
            )}
          </div>
        )}
      </div>

      <AdminNav />
    </main>
  );
}
