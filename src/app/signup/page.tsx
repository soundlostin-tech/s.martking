"use client";

import { motion } from "framer-motion";
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
import { Loader2, Eye, EyeOff, Star, ShieldCheck, Zap, ArrowLeft, User, Mail, Phone, Lock, CheckCircle2, Swords, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Identity name is required";
    if (!formData.email) {
      newErrors.email = "Deployment email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid signal format";
    }
    if (!formData.phone) {
      newErrors.phone = "Communication line is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Must be exactly 10 digits";
    }
    if (formData.password.length < 6) newErrors.password = "Access key too weak (min 6)";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Access keys do not match";
    if (!formData.terms) newErrors.terms = "Accept engagement terms";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please resolve the validation errors");
      return;
    }

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
        
        if (profileError) console.error("Profile creation error:", profileError);

        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          lifetime_earnings: 0,
          pending_withdrawals: 0,
        });
        
        if (walletError) console.error("Wallet creation error:", walletError);

        toast.success("Identity Created! Welcome to the Arena.");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Uplink failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 selection:bg-dark-emerald/30">
      {/* Left Side - Brand Identity */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-dark-emerald relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
         
         <div className="relative z-10">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-dark-emerald shadow-2xl">
               <Globe size={28} strokeWidth={2.5} />
             </div>
             <h1 className="text-2xl font-heading text-white">Smartking's Arena</h1>
           </div>
         </div>

         <div className="relative z-10 space-y-6">
           <h2 className="text-8xl font-heading text-white leading-[0.85] tracking-tighter">
             STAY <br /> <span className="italic opacity-50">STRONG.</span>
           </h2>
           <p className="text-white/60 text-lg font-outfit font-black uppercase tracking-[0.2em] max-w-sm">
             JOIN THE PREMIER MOBILE COMBAT ARENA AND EARN REWARDS.
           </p>
         </div>

         <div className="relative z-10 flex items-center gap-4">
           <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-4 border-dark-emerald bg-white/10 backdrop-blur-md" />
             ))}
           </div>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
             <span className="text-white">12K+</span> WARRIORS ALREADY ENLISTED
           </p>
         </div>
      </div>

      {/* Right Side - Clean White Form */}
      <div className="bg-white flex flex-col justify-center px-8 lg:px-24 py-12 relative overflow-y-auto">
        <nav className="absolute top-8 left-8 lg:left-24">
           <Link href="/" className="text-dark-emerald flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">
             <ChevronLeft size={16} strokeWidth={3} /> Back to Arena
           </Link>
        </nav>

        <div className="max-w-md w-full mx-auto space-y-8 pt-12 lg:pt-0">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading text-dark-emerald">Enlist Today</h1>
            <p className="text-slate-400 text-sm font-medium">Create your warrior identity.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warrior Alias</Label>
                <Input 
                  placeholder="e.g. ShadowHunter"
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 focus-visible:ring-dark-emerald/20"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Email</Label>
                <Input 
                  type="email"
                  placeholder="warrior@arena.com"
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 focus-visible:ring-dark-emerald/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Signal Connection (Phone)</Label>
                <div className="flex gap-3">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[90px] h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-dark-emerald focus:ring-dark-emerald/20">
                      <SelectValue placeholder="+91" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 text-dark-emerald rounded-2xl">
                      <SelectItem value="+91">+91</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="9876543210"
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 flex-1 focus-visible:ring-dark-emerald/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 pr-12 focus-visible:ring-dark-emerald/20"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-dark-emerald transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 group cursor-pointer" onClick={() => setFormData({ ...formData, terms: !formData.terms })}>
              <Checkbox 
                id="terms" 
                className="mt-1 w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-dark-emerald data-[state=checked]:border-dark-emerald" 
                checked={formData.terms}
              />
              <label className="text-[10px] font-bold text-slate-400 leading-tight cursor-pointer group-hover:text-dark-emerald transition-colors">
                I ACKNOWLEDGE THE <span className="text-dark-emerald">ARENA COMBAT PROTOCOLS</span> AND ENGAGEMENT TERMS.
              </label>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-dark-emerald hover:bg-dark-emerald/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-dark-emerald/20 border-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Initiate Enlistment"}
            </Button>

            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Already a warrior? <Link href="/signin" className="text-dark-emerald hover:underline">Establish Uplink</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
