"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Ban, MessageSquare, MoreHorizontal } from "lucide-react";

export default function AdminUsers() {
  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Users" 
        subtitle="Players, organizers, and admins."
        className="mx-0 rounded-none pb-32"
      />

      <div className="px-6 -mt-24 relative z-10 flex flex-col gap-6">
        <div className="bg-white rounded-[32px] p-6 shadow-xl border border-stone-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total</p>
              <p className="text-xl font-heading">12.5k</p>
            </div>
            <div className="text-center border-x border-stone-100">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Active</p>
              <p className="text-xl font-heading text-olive">8.2k</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Banned</p>
              <p className="text-xl font-heading text-red-500">42</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <Input className="bg-white border-stone-200 pl-12 rounded-full h-12 shadow-sm" placeholder="Search by name or email..." />
        </div>

        <div className="flex flex-col gap-3">
          {[
            { name: "Smartking Elite", email: "smart@king.com", role: "ADMIN", status: "Active", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" },
            { name: "KillerKing_99", email: "killer@ff.com", role: "PLAYER", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
            { name: "ShadowNinja", email: "shadow@ninja.com", role: "PLAYER", status: "Active", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
            { name: "Bad_Actor", email: "bad@actor.com", role: "PLAYER", status: "Suspended", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop" },
          ].map((user, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-stone-100">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm">{user.name}</h4>
                    <p className="text-[10px] text-stone-500">{user.email}</p>
                  </div>
                </div>
                <Badge className={`text-[8px] h-4 rounded-full border-none ${user.status === "Suspended" ? "bg-red-100 text-red-600" : "bg-lime-yellow/20 text-olive"}`}>
                  {user.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                <Badge className="bg-stone-100 text-stone-500 border-none text-[9px]">{user.role}</Badge>
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
          ))}
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
