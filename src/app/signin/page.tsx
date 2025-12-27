"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Swords, ShieldCheck, Zap } from "lucide-react";
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

      toast.success("Signed in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Signin error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-seashell-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-malachite-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-malachite-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full bg-seashell-100 border border-shadow-green-200 shadow-2xl rounded-[3rem] overflow-hidden animate-fadeIn"
      >
        <div className="bg-malachite-400/10 p-10 border-b border-shadow-green-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-malachite-400 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-malachite-400/20 mb-2">
              <Swords size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-malachite-500 uppercase tracking-[0.4em]">Combat Uplink</h4>
              <h1 className="text-4xl font-heading text-evergreen-950 leading-tight">
                Welcome <span className="italic font-serif opacity-60">Back.</span>
              </h1>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-malachite-400/20 blur-[80px] rounded-full" />
        </div>

        <div className="p-10 md:p-12 space-y-10">
          <form className="space-y-8" onSubmit={handleSignin}>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold text-shadow-green-400 uppercase tracking-[0.3em] ml-4">Deployment Email</Label>
              <input 
                id="email" 
                type="email" 
                placeholder="warrior@arena.com" 
                className={`w-full h-16 px-8 rounded-[2rem] border-none bg-seashell-50 shadow-inner text-evergreen-800 font-bold text-xs tracking-wide focus:ring-2 focus:ring-malachite-400/20 placeholder:text-shadow-green-300 ${errors.email ? 'ring-2 ring-sea-green-600/50' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="text-[10px] text-sea-green-600 px-6 mt-1 font-bold">{errors.email}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                <Label htmlFor="password" className="text-[10px] font-bold text-shadow-green-400 uppercase tracking-[0.3em]">Access Protocol</Label>
                <button type="button" className="text-[10px] text-malachite-500/60 hover:text-malachite-500 font-bold uppercase tracking-widest transition-colors">Recover Keys?</button>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`w-full h-16 px-8 pr-16 rounded-[2rem] border-none bg-seashell-50 shadow-inner text-evergreen-800 font-bold text-xs tracking-wide focus:ring-2 focus:ring-malachite-400/20 placeholder:text-shadow-green-300 ${errors.password ? 'ring-2 ring-sea-green-600/50' : ''}`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-shadow-green-400 hover:text-evergreen-800 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-sea-green-600 px-6 mt-1 font-bold">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[2rem] bg-sea-green-600 hover:bg-sea-green-500 text-white font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-sea-green-600/20 mt-4 border-none" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ESTABLISH UPLINK"}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-[10px] font-bold text-shadow-green-400 uppercase tracking-[0.2em]">
              NEW TO THE ARENA?{" "}
              <Link href="/signup" className="text-malachite-500 hover:text-sea-green-600 transition-colors">
                CREATE IDENTITY
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="bg-seashell-50 p-6 flex items-center justify-center gap-8 border-t border-shadow-green-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-malachite-500" />
            <span className="text-[8px] font-bold text-shadow-green-400 uppercase tracking-widest">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-malachite-500" />
            <span className="text-[8px] font-bold text-shadow-green-400 uppercase tracking-widest">FAST UPLINK</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
