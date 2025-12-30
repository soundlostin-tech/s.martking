"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Loader2, Eye, EyeOff, UserPlus, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/BentoCard";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const validate = () => {
    if (!formData.fullname.trim()) {
      toast.error("Callsign is required");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Valid email protocol required");
      return false;
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone ID must be 10 digits");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Access key must be 6+ characters");
      return false;
    }
    if (!formData.terms) {
      toast.error("Authorize Arena Terms to proceed");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${formData.phone}`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullname,
            phone: fullPhone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: formData.fullname,
          phone: fullPhone,
          username: formData.fullname.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000),
          role: "Player",
          status: "Active",
          win_rate: 0,
          matches_played: 0,
        });
        
        if (profileError) console.error("Profile authorization error:", profileError);

        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          lifetime_earnings: 0,
          pending_withdrawals: 0,
        });
        
        if (walletError) console.error("Wallet initialization error:", walletError);

        toast.success("Enlistment successful! Redirecting to HQ.");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Enlistment failed. Retry deployment.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-5 selection:bg-[#6EBF8B]/30">
      <div className="w-full max-w-md space-y-8">
        <section className="text-center">
          <div className="w-20 h-20 bg-[#F5E6A3] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-6 group hover:rotate-0 transition-transform">
            <UserPlus size={40} className="text-[#1A1A1A]" strokeWidth={2.5} />
          </div>
          <h1 className="text-[44px] font-heading text-[#1A1A1A] leading-[0.9] font-black tracking-tighter">
            ENLIST NOW
          </h1>
          <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-[0.2em] mt-3">
            Secure your arena identification
          </p>
        </section>

        <BentoCard className="p-8 shadow-2xl rounded-[40px] border-none bg-white relative overflow-hidden group">
          <form onSubmit={handleSignup} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">CALLSIGN (FULL NAME)</Label>
              <Input 
                ref={nameInputRef}
                placeholder="Operative Name"
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 focus:border-[#6EBF8B] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">COMM LINK (EMAIL)</Label>
              <Input 
                type="email"
                placeholder="intel@arena.com"
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 focus:border-[#6EBF8B] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">MOBILE ID</Label>
              <div className="flex gap-3">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-28 h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white font-black text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-0 shadow-sm">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl border-none shadow-2xl p-2">
                    <SelectItem value="+91" className="font-black rounded-xl px-4 py-2">+91</SelectItem>
                    <SelectItem value="+1" className="font-black rounded-xl px-4 py-2">+1</SelectItem>
                    <SelectItem value="+44" className="font-black rounded-xl px-4 py-2">+44</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="tel"
                  placeholder="9876543210"
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 flex-1 focus:border-[#5FD3BC] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">ACCESS KEY (PASSWORD)</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Secret Code"
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 pr-14 focus:border-[#6EBF8B] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff size={24} strokeWidth={2.5} /> : <Eye size={24} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div 
              className="flex items-start gap-4 p-2 cursor-pointer group/terms bg-[#F9FAFB] rounded-2xl border-2 border-transparent hover:border-[#5FD3BC]/30 transition-all"
              onClick={() => setFormData({ ...formData, terms: !formData.terms })}
            >
              <Checkbox 
                id="terms" 
                className="mt-1 w-6 h-6 rounded-lg border-2 border-[#D1D5DB] data-[state=checked]:bg-[#1A1A1A] data-[state=checked]:border-[#1A1A1A]" 
                checked={formData.terms}
              />
              <label className="text-[11px] font-black text-[#6B7280] leading-relaxed cursor-pointer group-hover/terms:text-[#1A1A1A] transition-colors uppercase tracking-tight">
                I accept the <span className="text-[#1A1A1A] underline decoration-[#6EBF8B] decoration-4 underline-offset-4">ARENA PROTOCOLS</span> and the data privacy directives
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center relative overflow-hidden disabled:bg-[#E5E7EB] transition-all hover:bg-black"
            >
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "DEPLOY TO ARENA"}
            </motion.button>

            <div className="pt-4 text-center">
              <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                ALREADY ENLISTED?{" "}
                <Link href="/signin" className="text-[#1A1A1A] underline decoration-[#F5E6A3] decoration-4 underline-offset-4 hover:decoration-[#6EBF8B] transition-all">
                  AUTHORIZE ACCESS
                </Link>
              </p>
            </div>
          </form>
          
          <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            <Zap size={240} />
          </div>
        </BentoCard>
      </div>
    </main>
  );
}
