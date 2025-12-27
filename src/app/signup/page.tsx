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
import { Loader2, Eye, EyeOff, Star, ShieldCheck, Zap, ArrowLeft, User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      
      // 1. Auth Signup
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
        // 2. Create Profile
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
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
          // We don't throw here to avoid blocking the user if auth succeeded but profile failed
          // (though in a real app we'd want to handle this better)
        }

        // 3. Create Wallet
        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          lifetime_earnings: 0,
          pending_withdrawals: 0,
        });
        
        if (walletError) {
          console.error("Wallet creation error:", walletError);
        }

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
    <main className="min-h-screen bg-evergreen-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden py-24">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-sea-green-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-malachite-400/10 rounded-full blur-[80px] sm:blur-[120px]" />
      </div>

      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link 
          href="/"
          className="flex items-center gap-2 text-[10px] font-bold text-evergreen-300 uppercase tracking-widest hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-malachite-500 transition-colors">
            <ArrowLeft size={14} className="text-white" />
          </div>
          <span className="hidden sm:inline">Back to Arena</span>
        </Link>
      </motion.div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[500px] bg-evergreen-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden z-10"
      >
        <div className="bg-gradient-to-br from-malachite-500/10 to-transparent p-8 sm:p-10 border-b border-white/5 relative overflow-hidden text-center">
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-malachite-400 to-sea-green-600 text-black rounded-2xl flex items-center justify-center shadow-xl shadow-malachite-500/20"
            >
              <Star size={28} className="sm:w-8 sm:h-8" />
            </motion.div>
            <div className="space-y-1">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-malachite-400 uppercase tracking-[0.4em]">Enlistment Protocol</h4>
              <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold text-white leading-tight tracking-tight">
                Create <span className="text-malachite-400 italic">Identity.</span>
              </h1>
            </div>
          </div>
          <div className="absolute -top-1/2 -right-1/4 w-64 h-64 bg-malachite-500/20 blur-[60px] rounded-full pointer-events-none" />
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          <form className="space-y-6" onSubmit={handleSignup}>
            {/* Identity Name */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Identity Name</Label>
                <User size={12} className="text-evergreen-500" />
              </div>
              <div className="relative group">
                <input 
                  placeholder="COMMANDER NAME" 
                  className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.fullname ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 transition-all placeholder:text-evergreen-700`}
                  value={formData.fullname}
                  onChange={(e) => {
                    setFormData({ ...formData, fullname: e.target.value });
                    if (errors.fullname) setErrors({ ...errors, fullname: "" });
                  }}
                />
              </div>
              {errors.fullname && (
                <p className="text-[9px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.fullname}</p>
              )}
            </div>

            {/* Deployment Email */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Deployment Email</Label>
                <Mail size={12} className="text-evergreen-500" />
              </div>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="WARRIOR@ARENA.COM" 
                  className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.email ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 transition-all placeholder:text-evergreen-700`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-[9px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.email}</p>
              )}
            </div>

            {/* Signal Connection (Phone) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Signal Connection</Label>
                <Phone size={12} className="text-evergreen-500" />
              </div>
              <div className="flex gap-3">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[85px] h-14 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 bg-white/5 font-bold text-xs text-white focus:ring-malachite-500/20">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="bg-evergreen-900 border-white/10 text-white rounded-2xl">
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative group flex-1">
                  <input 
                    placeholder="9876543210" 
                    className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.phone ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 transition-all placeholder:text-evergreen-700`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-[9px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.phone}</p>
              )}
            </div>

            {/* Access Protocol (Password) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Access Protocol</Label>
                  <Lock size={12} className="text-evergreen-500" />
                </div>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••" 
                    className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.password ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 transition-all placeholder:text-evergreen-700`}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-evergreen-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[9px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Confirm Keys</Label>
                  <CheckCircle2 size={12} className="text-evergreen-500" />
                </div>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••" 
                    className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.confirmPassword ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 transition-all placeholder:text-evergreen-700`}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[9px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-3 px-4 py-2 group cursor-pointer" onClick={() => setFormData({ ...formData, terms: !formData.terms })}>
              <Checkbox 
                id="terms" 
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 data-[state=checked]:bg-malachite-500 data-[state=checked]:text-black transition-all" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-widest cursor-pointer group-hover:text-white transition-colors">
                I accept the <span className="text-malachite-400">Terms of Engagement</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-r from-malachite-500 to-sea-green-600 hover:from-malachite-400 hover:to-sea-green-500 text-black font-extrabold text-[10px] sm:text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-malachite-500/10 mt-2 border-none disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-tap" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>INITIALIZING...</span>
                </div>
              ) : "ENLIST IN ARENA"}
            </motion.button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-evergreen-400 uppercase tracking-[0.2em]">
              ALREADY ENLISTED?{" "}
              <Link href="/signin" className="text-malachite-400 hover:text-white transition-colors underline underline-offset-4 decoration-malachite-400/30 font-extrabold">
                ESTABLISH UPLINK
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-white/5 p-5 sm:p-6 flex items-center justify-center gap-6 sm:gap-10 border-t border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-malachite-400" />
            <span className="text-[8px] sm:text-[9px] font-bold text-evergreen-400 uppercase tracking-widest">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-malachite-400" />
            <span className="text-[8px] sm:text-[9px] font-bold text-evergreen-400 uppercase tracking-widest">FAST SYNC</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
