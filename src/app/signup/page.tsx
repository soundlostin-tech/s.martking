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
import { Loader2, Eye, EyeOff, ChevronLeft } from "lucide-react";
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
    terms: false,
  });
  const router = useRouter();

  const validate = () => {
    if (!formData.fullname.trim()) {
      toast.error("Name is required");
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
      toast.error("Please accept the terms");
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

        toast.success("Account created! Welcome to Smartking's Arena.");
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
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Brand Identity */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-[#00A3FF] to-[#44BCFF] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#11130D 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#11130D] rounded-xl flex items-center justify-center shadow-2xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading text-[#11130D]">Smartking's Arena</h1>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-7xl font-heading text-[#11130D] leading-[0.9]">
            Join the<br />
            <span className="text-[#11130D]/50">Arena Today</span>
          </h2>
          <p className="text-[#11130D]/70 text-lg font-medium max-w-sm">
            Create your account and start competing in Free Fire tournaments for real prizes.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-[#00A3FF] bg-[#11130D]/20 backdrop-blur-md" />
            ))}
          </div>
          <p className="text-[#11130D]/60 text-[11px] font-bold uppercase tracking-wide">
            <span className="text-[#11130D]">12K+</span> warriors already enlisted
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="bg-[#D4D7DE] flex flex-col justify-center px-8 lg:px-24 py-12 relative blob-header blob-header-mint overflow-y-auto">
        <nav className="absolute top-8 left-8 lg:left-24">
          <Link href="/" className="text-[#11130D] flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide hover:opacity-70 transition-opacity">
            <ChevronLeft size={16} strokeWidth={3} /> Back
          </Link>
        </nav>

        <div className="max-w-md w-full mx-auto space-y-6 relative z-10 pt-12 lg:pt-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#00A3FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00A3FF]/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="#11130D" strokeWidth="2.5" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h1 className="text-lg font-heading text-[#11130D]">Smartking's Arena</h1>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-heading text-[#11130D]">Create Account</h1>
            <p className="text-[#4A4B48] text-sm font-medium">Join the arena and start winning</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide ml-1">Full Name</Label>
              <Input 
                placeholder="Your name"
                className="h-14 rounded-xl bg-white border border-[#C8C8C4]/30 text-[#11130D] font-medium px-5 focus-visible:ring-[#00A3FF]"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide ml-1">Email</Label>
              <Input 
                type="email"
                placeholder="name@example.com"
                className="h-14 rounded-xl bg-white border border-[#C8C8C4]/30 text-[#11130D] font-medium px-5 focus-visible:ring-[#00A3FF]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide ml-1">Phone</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[90px] h-14 rounded-xl bg-white border border-[#C8C8C4]/30 font-bold text-[#11130D] focus:ring-[#00A3FF]">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#C8C8C4]/30 text-[#11130D] rounded-xl">
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="9876543210"
                  className="h-14 rounded-xl bg-white border border-[#C8C8C4]/30 text-[#11130D] font-medium px-5 flex-1 focus-visible:ring-[#00A3FF]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#4A4B48] uppercase tracking-wide ml-1">Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 rounded-xl bg-white border border-[#C8C8C4]/30 text-[#11130D] font-medium px-5 pr-12 focus-visible:ring-[#00A3FF]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4B48] hover:text-[#11130D] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setFormData({ ...formData, terms: !formData.terms })}>
              <Checkbox 
                id="terms" 
                className="mt-1 w-5 h-5 rounded-md border-[#C8C8C4] data-[state=checked]:bg-[#00A3FF] data-[state=checked]:border-[#00A3FF] data-[state=checked]:text-[#11130D]" 
                checked={formData.terms}
              />
              <label className="text-[10px] font-medium text-[#4A4B48] leading-tight cursor-pointer">
                I agree to the <span className="text-[#868935] font-bold">Terms of Service</span> and <span className="text-[#868935] font-bold">Privacy Policy</span>
              </label>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#00A3FF] text-[#11130D] rounded-xl font-bold uppercase tracking-wide text-[11px] shadow-lg shadow-[#00A3FF]/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
            </motion.button>

            <p className="text-center text-[11px] font-medium text-[#4A4B48]">
              Already have an account? <Link href="/signin" className="text-[#868935] font-bold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
