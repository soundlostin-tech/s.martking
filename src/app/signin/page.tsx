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
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 selection:bg-dark-emerald/30">
        {/* Left Side - Brand Identity */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-dark-emerald relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
           
           <div className="relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-dark-emerald shadow-2xl">
                 <Globe size={28} strokeWidth={2.5} />
               </div>
               <h1 className="text-2xl font-heading text-white">Smartking's Arena</h1>
             </div>
           </div>

           <div className="relative z-10 space-y-6">
             <h2 className="text-8xl font-heading text-white leading-[0.85] tracking-tighter">
               STAY <br /> <span className="italic opacity-50">STRONG.</span>
             </h2>
             <p className="text-white/60 text-lg font-outfit font-black uppercase tracking-[0.2em] max-w-sm">
               RE-ENTER THE PREMIER MOBILE COMBAT ARENA.
             </p>
           </div>

           <div className="relative z-10 flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-dark-emerald bg-white/10 backdrop-blur-md" />
               ))}
             </div>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
               JOINED BY <span className="text-white">2.4K+</span> WARRIORS TODAY
             </p>
           </div>
        </div>

        {/* Right Side - Clean White Form */}
        <div className="bg-white flex flex-col justify-center px-8 lg:px-24 py-12 relative">
          <nav className="absolute top-8 left-8 lg:left-24">
             <Link href="/" className="text-dark-emerald flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">
               <ChevronLeft size={16} strokeWidth={3} /> Back to Arena
             </Link>
          </nav>

          <div className="max-w-md w-full mx-auto space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading text-dark-emerald">Welcome Back</h1>
              <p className="text-slate-400 text-sm font-medium">Access your arena deployment console.</p>
            </div>

            <form onSubmit={handleSignin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warrior Email</Label>
                  <Input 
                    placeholder="name@arena.com"
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 focus-visible:ring-dark-emerald/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-dark-emerald font-semibold px-5 pr-12 focus-visible:ring-dark-emerald/20"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-dark-emerald transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-dark-emerald hover:bg-dark-emerald/90 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-dark-emerald/20 border-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Authorize Deployment"}
              </Button>

              <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                New to the arena? <Link href="/signup" className="text-dark-emerald hover:underline">Join the fight</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    );
}
