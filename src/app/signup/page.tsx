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
import { Loader2, Eye, EyeOff, ChevronLeft, Zap, User, Mail, Phone, Lock } from "lucide-react";
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
    // Auto-focus first input on page load
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const validate = () => {
    if (!formData.fullname.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone must be 10 digits");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!formData.terms) {
      toast.error("Please accept the terms & conditions");
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
        
        if (profileError) console.error("Profile creation error:", profileError);

        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          lifetime_earnings: 0,
          pending_withdrawals: 0,
        });
        
        if (walletError) console.error("Wallet creation error:", walletError);

        toast.success("Welcome to the Arena! Please sign in.");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative z-10 flex flex-col">
      {/* Navigation / Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03] active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-onyx" strokeWidth={2.5} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-onyx rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-electric-blue" fill="currentColor" />
          </div>
          <span className="text-[10px] font-black text-onyx uppercase tracking-[0.2em]">Smartking</span>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <section>
            <h1 className="text-[44px] font-heading text-onyx leading-tight font-black">
              Join the <br />
              <span className="text-charcoal-brown/40">Elite Ranks</span>
            </h1>
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mt-2">
              Create your legend today
            </p>
          </section>

          <BentoCard className="p-8 border-none shadow-[0_12px_48px_rgba(0,0,0,0.06)] mb-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="fullname"
                    className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input 
                      ref={nameInputRef}
                      id="fullname"
                      placeholder="John Doe"
                      className="h-14 rounded-[20px] bg-off-white/50 border-none text-onyx font-bold px-6 focus-visible:ring-2 focus-visible:ring-onyx/10 placeholder:text-charcoal/20"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="email"
                    className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1"
                  >
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-14 rounded-[20px] bg-off-white/50 border-none text-onyx font-bold px-6 focus-visible:ring-2 focus-visible:ring-onyx/10 placeholder:text-charcoal/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="phone"
                    className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1"
                  >
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-24 h-14 rounded-[20px] bg-off-white/50 border-none font-bold text-onyx focus:ring-2 focus:ring-onyx/10">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-none rounded-2xl shadow-xl">
                        <SelectItem value="+91" className="font-bold">+91</SelectItem>
                        <SelectItem value="+1" className="font-bold">+1</SelectItem>
                        <SelectItem value="+44" className="font-bold">+44</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="h-14 rounded-[20px] bg-off-white/50 border-none text-onyx font-bold px-6 flex-1 focus-visible:ring-2 focus-visible:ring-onyx/10 placeholder:text-charcoal/20"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="password"
                    className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-14 rounded-[20px] bg-off-white/50 border-none text-onyx font-bold px-6 pr-14 focus-visible:ring-2 focus-visible:ring-onyx/10 placeholder:text-charcoal/20"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-onyx transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div 
                className="flex items-start gap-3 p-1 cursor-pointer group"
                onClick={() => setFormData({ ...formData, terms: !formData.terms })}
              >
                <Checkbox 
                  id="terms" 
                  className="mt-1 w-5 h-5 rounded-md border-onyx/10 data-[state=checked]:bg-onyx data-[state=checked]:border-onyx" 
                  checked={formData.terms}
                />
                <label className="text-[10px] font-bold text-charcoal/60 leading-relaxed cursor-pointer group-hover:text-onyx transition-colors">
                  I agree to the <span className="text-onyx underline decoration-electric-blue decoration-2 underline-offset-2">Terms of Service</span> and <span className="text-onyx underline decoration-electric-blue decoration-2 underline-offset-2">Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-onyx text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-onyx/20 flex items-center justify-center relative overflow-hidden group disabled:opacity-70"
              >
                <span className={loading ? "opacity-0" : "opacity-100 transition-opacity"}>Create Account</span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-electric-blue" />
                  </div>
                )}
                <div className="absolute right-[-10px] top-[-10px] w-12 h-12 bg-electric-blue/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              </motion.button>

              <div className="pt-2 text-center">
                <p className="text-[11px] font-bold text-charcoal/40 uppercase tracking-widest">
                  Already a warrior?{" "}
                  <Link href="/signin" className="text-onyx font-black underline decoration-electric-blue decoration-2 underline-offset-4">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </BentoCard>
        </div>
      </div>
      
      {/* Footer / Safe Area Spacer */}
      <footer className="h-12" />
    </main>
  );
}
