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
    <main className="min-h-[100dvh] bg-carbon-black flex flex-col relative overflow-hidden selection:bg-dark-emerald selection:text-white py-4 sm:py-0">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-depths/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-dark-emerald/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 sm:p-8">
        <Link 
          href="/"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
        >
          <ChevronLeft className="text-white" size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-dark-emerald to-emerald-depths rounded-lg flex items-center justify-center shadow-lg shadow-dark-emerald/20">
            <Swords size={16} className="text-white" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Arena</span>
        </div>
        <div className="w-10 h-10" />
      </nav>

      {/* Content Container */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 pb-12 max-w-xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-outfit font-black text-white tracking-tight">
              Create <span className="text-dark-emerald">Identity.</span>
            </h1>
            <p className="text-white/60 font-medium text-sm sm:text-base leading-relaxed max-w-[320px]">
              Enlist now to access the global combat network and earn rewards.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                  Full Name / Alias
                </Label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-emerald" size={18} />
                  <input
                    id="fullname"
                    placeholder="COMMANDER NAME"
                    className={`w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border-2 ${
                      errors.fullname ? 'border-destructive/50' : 'border-white/5 focus:border-dark-emerald/50'
                    } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-dark-emerald/10 placeholder:text-white/20`}
                    value={formData.fullname}
                    onChange={(e) => {
                      setFormData({ ...formData, fullname: e.target.value });
                      if (errors.fullname) setErrors({ ...errors, fullname: "" });
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                  Deployment Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-emerald" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="warrior@arena.com"
                    className={`w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border-2 ${
                      errors.email ? 'border-destructive/50' : 'border-white/5 focus:border-dark-emerald/50'
                    } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-dark-emerald/10 placeholder:text-white/20`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                  Signal Connection
                </Label>
                <div className="flex gap-3">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[100px] h-16 rounded-2xl bg-white/5 border-2 border-white/5 font-bold text-white focus:ring-dark-emerald/20">
                      <SelectValue placeholder="+91" />
                    </SelectTrigger>
                    <SelectContent className="bg-jet-black border-white/10 text-white rounded-2xl">
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-emerald" size={18} />
                    <input
                      id="phone"
                      placeholder="9876543210"
                      className={`w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border-2 ${
                        errors.phone ? 'border-destructive/50' : 'border-white/5 focus:border-dark-emerald/50'
                      } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-dark-emerald/10 placeholder:text-white/20`}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    Access Key
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-emerald" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full h-16 pl-14 pr-14 rounded-2xl bg-white/5 border-2 ${
                        errors.password ? 'border-destructive/50' : 'border-white/5 focus:border-dark-emerald/50'
                      } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-dark-emerald/10 placeholder:text-white/20`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    Confirm Key
                  </Label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-emerald" size={18} />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border-2 ${
                        errors.confirmPassword ? 'border-destructive/50' : 'border-white/5 focus:border-dark-emerald/50'
                      } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-dark-emerald/10 placeholder:text-white/20`}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Action */}
            <div className="space-y-6 pt-2">
              <div 
                className="flex items-start space-x-3 group cursor-pointer" 
                onClick={() => setFormData({ ...formData, terms: !formData.terms })}
              >
                <Checkbox 
                  id="terms" 
                  className="mt-1 w-5 h-5 rounded-md border-white/10 bg-white/5 data-[state=checked]:bg-dark-emerald data-[state=checked]:text-white transition-all" 
                  checked={formData.terms}
                  onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                />
                <label className="text-[10px] sm:text-xs font-medium text-white/40 leading-relaxed cursor-pointer group-hover:text-white transition-colors">
                  I acknowledge the <span className="text-dark-emerald font-bold">Arena Combat Protocols</span> and the privacy guidelines.
                </label>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-2xl bg-dark-emerald hover:bg-dark-emerald/90 text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg shadow-dark-emerald/20 active:scale-[0.98] transition-all border-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Initializing...</span>
                    </div>
                  ) : (
                    "Complete Enlistment"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Already Enlisted?{" "}
                    <Link href="/signin" className="text-dark-emerald hover:text-white transition-colors underline underline-offset-4 decoration-dark-emerald/30 font-black">
                      Establish Uplink
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 p-8 text-center sm:hidden">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <Zap size={14} className="text-dark-emerald" />
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Live Combat Feed Active</span>
        </div>
      </footer>
    </main>
  );
}
