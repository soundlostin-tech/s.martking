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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
    <main className="min-h-screen bg-[#F5F5F5] relative flex flex-col">
      <div className="unified-bg" />
      
      <div className="flex-1 flex flex-col px-4 py-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          <section>
            <h1 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
              Join the Arena
            </h1>
            <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mt-2">
              Create your legend today
            </p>
          </section>

          <div className="bg-white rounded-lg p-6 shadow-[2px_8px_16px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="form-label">
                  Full Name
                </Label>
                <Input 
                  ref={nameInputRef}
                  id="fullname"
                  placeholder="John Doe"
                  className="form-input h-12 rounded-lg bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium px-4 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="form-label">
                  Email Address
                </Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="form-input h-12 rounded-lg bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium px-4 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="form-label">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-24 h-12 rounded-lg bg-white border border-[#E5E7EB] font-medium text-[#1A1A1A] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20">
                      <SelectValue placeholder="+91" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg">
                      <SelectItem value="+91" className="font-medium">+91</SelectItem>
                      <SelectItem value="+1" className="font-medium">+1</SelectItem>
                      <SelectItem value="+44" className="font-medium">+44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    className="form-input h-12 rounded-lg bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium px-4 flex-1 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="form-label">
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="form-input h-12 rounded-lg bg-white border border-[#E5E7EB] text-[#1A1A1A] font-medium px-4 pr-12 focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 placeholder:text-[#9CA3AF]"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors touch-target"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div 
                className="flex items-start gap-3 p-1 cursor-pointer group"
                onClick={() => setFormData({ ...formData, terms: !formData.terms })}
              >
                <Checkbox 
                  id="terms" 
                  className="mt-0.5 w-5 h-5 rounded border-[#E5E7EB] data-[state=checked]:bg-[#5FD3BC] data-[state=checked]:border-[#5FD3BC]" 
                  checked={formData.terms}
                />
                <label className="text-[11px] font-medium text-[#6B7280] leading-relaxed cursor-pointer group-hover:text-[#1A1A1A] transition-colors">
                  I agree to the <span className="text-[#1A1A1A] underline decoration-[#5FD3BC] decoration-2 underline-offset-2">Terms of Service</span> and <span className="text-[#1A1A1A] underline decoration-[#5FD3BC] decoration-2 underline-offset-2">Privacy Policy</span>
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg font-bold uppercase tracking-[0.1em] text-[12px] shadow-lg shadow-[#5FD3BC]/20 flex items-center justify-center relative overflow-hidden disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors"
              >
                <span className={loading ? "opacity-0" : "opacity-100 transition-opacity"}>Create Account</span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" />
                  </div>
                )}
              </motion.button>

              <div className="pt-2 text-center">
                <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">
                  Already a warrior?{" "}
                  <Link href="/signin" className="text-[#1A1A1A] font-bold underline decoration-[#5FD3BC] decoration-2 underline-offset-4">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <footer className="h-8" />
    </main>
  );
}
