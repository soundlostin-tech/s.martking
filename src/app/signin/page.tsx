"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Swords, ShieldCheck, Zap, ArrowLeft, Mail, Lock, ChevronLeft } from "lucide-react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      toast.success("Welcome back to the Arena!");
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
    <main className="min-h-[100dvh] bg-evergreen-950 flex flex-col relative overflow-hidden selection:bg-malachite-500 selection:text-black">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-malachite-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-sea-green-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
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
          <div className="w-8 h-8 bg-gradient-to-br from-malachite-400 to-sea-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-malachite-500/20">
            <Swords size={16} className="text-black" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Arena</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </nav>

      {/* Content Container */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 pb-12 max-w-lg mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          {/* Hero Section */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-outfit font-black text-white tracking-tight">
              Welcome <span className="text-malachite-400">Back.</span>
            </h1>
            <p className="text-evergreen-300 font-medium text-sm sm:text-base leading-relaxed max-w-[280px]">
              Secure connection established. Re-enter the combat arena.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSignin} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold text-evergreen-400 uppercase tracking-widest ml-1">
                  Deployment Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-evergreen-500" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="warrior@arena.com"
                    className={`w-full h-16 sm:h-18 pl-14 pr-6 rounded-2xl sm:rounded-[1.5rem] bg-white/5 border-2 ${
                      errors.email ? 'border-destructive/50' : 'border-white/5 focus:border-malachite-500/50'
                    } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-malachite-500/10 placeholder:text-evergreen-800`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-1">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-bold text-evergreen-400 uppercase tracking-widest">
                    Access Key
                  </Label>
                  <button type="button" className="text-[10px] text-malachite-400 font-black uppercase tracking-widest hover:text-malachite-300 transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-evergreen-500" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full h-16 sm:h-18 pl-14 pr-14 rounded-2xl sm:rounded-[1.5rem] bg-white/5 border-2 ${
                      errors.password ? 'border-destructive/50' : 'border-white/5 focus:border-malachite-500/50'
                    } text-white font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-malachite-500/10 placeholder:text-evergreen-800`}
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-destructive font-bold uppercase tracking-wider ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 sm:h-18 rounded-2xl sm:rounded-[1.5rem] bg-malachite-500 hover:bg-malachite-400 text-black font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg shadow-malachite-500/20 active:scale-[0.98] transition-all border-none"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Establishing Uplink...</span>
                  </div>
                ) : (
                  "Login to Arena"
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs font-bold text-evergreen-400 uppercase tracking-widest">
                  New Warrior?{" "}
                  <Link href="/signup" className="text-malachite-400 hover:text-white transition-colors underline underline-offset-4 decoration-malachite-400/30 font-black">
                    Join the Fight
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 p-8 text-center sm:hidden">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <ShieldCheck size={14} className="text-malachite-400" />
          <span className="text-[8px] font-black text-evergreen-400 uppercase tracking-[0.3em]">Encrypted Connection</span>
        </div>
      </footer>
    </main>
  );
}
