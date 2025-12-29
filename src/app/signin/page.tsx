"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ChevronLeft, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/BentoCard";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus first input on page load
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

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
        <div className="w-12" /> {/* Spacer for balance */}
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <section>
            <h1 className="text-[44px] font-heading text-onyx leading-tight font-black">
              Welcome <br />
              <span className="text-charcoal-brown/40">Back Warrior</span>
            </h1>
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em] mt-2">
              Sign in to resume your legend
            </p>
          </section>

          <BentoCard className="p-8 border-none shadow-[0_12px_48px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleSignin} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="email"
                    className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest ml-1"
                  >
                    Email Address
                  </Label>
                  <Input 
                    ref={emailInputRef}
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label 
                      htmlFor="password"
                      className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest"
                    >
                      Password
                    </Label>
                    <Link href="#" className="text-[9px] font-black text-charcoal/30 uppercase tracking-widest hover:text-onyx">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
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

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-onyx text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-onyx/20 flex items-center justify-center relative overflow-hidden group disabled:opacity-70"
              >
                <span className={loading ? "opacity-0" : "opacity-100 transition-opacity"}>Sign In</span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-electric-blue" />
                  </div>
                )}
                {/* Visual accent */}
                <div className="absolute right-[-10px] top-[-10px] w-12 h-12 bg-electric-blue/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              </motion.button>

              <div className="pt-4 text-center">
                <p className="text-[11px] font-bold text-charcoal/40 uppercase tracking-widest">
                  New to the Arena?{" "}
                  <Link href="/signup" className="text-onyx font-black underline decoration-electric-blue decoration-2 underline-offset-4">
                    Create Account
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
