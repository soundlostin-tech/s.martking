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
    <main className="min-h-screen bg-dark-slate-grey bg-[radial-gradient(circle_at_50%_0%,_#2d4d43_0%,_#243e36_100%)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-muted-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[3rem] overflow-hidden animate-fadeIn"
      >
        <div className="bg-[#0a4d4b] p-10 border-b border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-muted-teal text-white rounded-2xl flex items-center justify-center shadow-xl shadow-muted-teal/20 mb-2">
              <Swords size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-muted-teal uppercase tracking-[0.4em]">Combat Uplink</h4>
              <h1 className="text-4xl font-heading text-white leading-tight">
                Welcome <span className="italic font-serif text-white/60">Back.</span>
              </h1>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-muted-teal/20 blur-[80px] rounded-full" />
        </div>

        <div className="p-10 md:p-12 space-y-10">
          <form className="space-y-8" onSubmit={handleSignin}>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Deployment Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="warrior@arena.com" 
                className={`h-16 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-muted-teal placeholder:text-white/10 ${errors.email ? 'ring-2 ring-red-500/50' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="text-[10px] text-red-400 px-6 mt-1 font-bold">{errors.email}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                <Label htmlFor="password" className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Access Protocol</Label>
                <button type="button" className="text-[10px] text-muted-teal/60 hover:text-muted-teal font-bold uppercase tracking-widest transition-colors">Recover Keys?</button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`h-16 px-8 pr-16 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-muted-teal placeholder:text-white/10 ${errors.password ? 'ring-2 ring-red-500/50' : ''}`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-400 px-6 mt-1 font-bold">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[2rem] bg-muted-teal hover:bg-muted-teal/90 text-white font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-muted-teal/20 mt-4 border-none" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ESTABLISH UPLINK"}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              NEW TO THE ARENA?{" "}
              <Link href="/signup" className="text-muted-teal hover:text-white transition-colors">
                CREATE IDENTITY
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="bg-white/[0.02] p-6 flex items-center justify-center gap-8 border-t border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-muted-teal" />
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-muted-teal" />
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">FAST UPLINK</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
