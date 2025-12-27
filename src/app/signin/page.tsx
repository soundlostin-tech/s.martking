"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Swords, ShieldCheck, Zap, ArrowLeft, Mail, Lock } from "lucide-react";
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
    <main className="min-h-screen bg-evergreen-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decor - Refined for better mobile performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-malachite-400/10 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-sea-green-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
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
          <span>Back to Arena</span>
        </Link>
      </motion.div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[440px] bg-evergreen-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden z-10"
      >
        <div className="bg-gradient-to-br from-malachite-500/10 to-transparent p-8 sm:p-10 border-b border-white/5 relative overflow-hidden text-center">
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-malachite-400 to-sea-green-600 text-black rounded-2xl flex items-center justify-center shadow-xl shadow-malachite-500/20"
            >
              <Swords size={28} className="sm:w-8 sm:h-8" />
            </motion.div>
            <div className="space-y-1">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-malachite-400 uppercase tracking-[0.4em]">Combat Uplink</h4>
              <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold text-white leading-tight tracking-tight">
                Welcome <span className="text-malachite-400 italic">Back.</span>
              </h1>
            </div>
          </div>
          {/* Subtle glow effect */}
          <div className="absolute -top-1/2 -right-1/4 w-64 h-64 bg-malachite-500/20 blur-[60px] rounded-full pointer-events-none" />
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          <form className="space-y-6" onSubmit={handleSignin}>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="email" className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Deployment Email</Label>
                <Mail size={12} className="text-evergreen-500" />
              </div>
              <div className="relative group">
                <input 
                  id="email" 
                  type="email" 
                  placeholder="warrior@arena.com" 
                  className={`w-full h-14 sm:h-16 px-6 sm:px-8 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.email ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 focus:border-malachite-500/50 transition-all placeholder:text-evergreen-700`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[10px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.email}</motion.p>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-[9px] sm:text-[10px] font-bold text-evergreen-300 uppercase tracking-[0.2em] ml-1">Access Protocol</Label>
                <button type="button" className="text-[9px] sm:text-[10px] text-malachite-400 hover:text-white font-bold uppercase tracking-widest transition-colors haptic-tap">Recover Keys?</button>
              </div>
              <div className="relative group">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`w-full h-14 sm:h-16 px-6 sm:px-8 pr-14 rounded-[1.5rem] sm:rounded-[2rem] border ${errors.password ? 'border-destructive/50 ring-destructive/10' : 'border-white/10 group-hover:border-malachite-500/50'} bg-white/5 shadow-inner text-white font-bold text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-malachite-500/20 focus:border-malachite-500/50 transition-all placeholder:text-evergreen-700`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 text-evergreen-400 hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[10px] text-destructive px-2 font-bold uppercase tracking-wider">{errors.password}</motion.p>
              )}
            </div>

            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-r from-malachite-500 to-sea-green-600 hover:from-malachite-400 hover:to-sea-green-500 text-black font-extrabold text-[10px] sm:text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-malachite-500/10 mt-2 border-none disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-tap" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SYNCING...</span>
                </div>
              ) : "ESTABLISH UPLINK"}
            </motion.button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-evergreen-400 uppercase tracking-[0.2em]">
              NEW TO THE ARENA?{" "}
              <Link href="/signup" className="text-malachite-400 hover:text-white transition-colors underline underline-offset-4 decoration-malachite-400/30 font-extrabold">
                CREATE IDENTITY
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
