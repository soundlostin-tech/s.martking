"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ChevronLeft, Globe2 as Globe } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const validate = () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message === "Email not confirmed") {
          toast.error("Please confirm your email address before signing in.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message || "An error occurred during signin");
        }
        return;
      }

      toast.success("Welcome back to Smartking's Arena!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Signin error:", error);
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
            Compete.<br />
            <span className="text-[#11130D]/50">Win. Withdraw.</span>
          </h2>
          <p className="text-[#11130D]/70 text-lg font-medium max-w-sm">
            Join verified Free Fire tournaments and win real cash prizes.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-[#00A3FF] bg-[#11130D]/20 backdrop-blur-md" />
            ))}
          </div>
          <p className="text-[#11130D]/60 text-[11px] font-bold uppercase tracking-wide">
            <span className="text-[#11130D]">2.4K+</span> warriors online now
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="bg-[#D4D7DE] flex flex-col justify-center px-8 lg:px-24 py-12 relative blob-header blob-header-coral">
        <nav className="absolute top-8 left-8 lg:left-24">
          <Link href="/" className="text-[#11130D] flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide hover:opacity-70 transition-opacity">
            <ChevronLeft size={16} strokeWidth={3} /> Back
          </Link>
        </nav>

        <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#00A3FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00A3FF]/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="#11130D" strokeWidth="2.5" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h1 className="text-lg font-heading text-[#11130D]">Smartking's Arena</h1>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-heading text-[#11130D]">Welcome Back</h1>
            <p className="text-[#4A4B48] text-sm font-medium">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignin} className="space-y-5">
            <div className="space-y-4">
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
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-[10px] font-bold text-[#868935] uppercase tracking-wide hover:underline">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#00A3FF] text-[#11130D] rounded-xl font-bold uppercase tracking-wide text-[11px] shadow-lg shadow-[#00A3FF]/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In"}
            </motion.button>

            <p className="text-center text-[11px] font-medium text-[#4A4B48]">
              Don't have an account? <Link href="/signup" className="text-[#868935] font-bold hover:underline">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
