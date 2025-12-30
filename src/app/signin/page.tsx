"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

    const [cooldown, setCooldown] = useState(0);
    const [failedAttempts, setFailedAttempts] = useState(0);

    useEffect(() => {
      if (cooldown > 0) {
        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [cooldown]);

    const handleSignin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      if (cooldown > 0) {
        toast.error(`Too many attempts. Please wait ${cooldown} seconds.`);
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setFailedAttempts(prev => prev + 1);
          if (failedAttempts >= 2) {
            setCooldown(30 * (failedAttempts - 1));
          }
          // ...


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
    <main className="min-h-screen bg-[#F5F5F5] relative flex flex-col">
      {/* Background is now global */}
      
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <section>
            <h1 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
              Welcome Back
            </h1>
            <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mt-2">
              Sign in to resume your legend
            </p>
          </section>

          <div className="bg-white rounded-lg p-6 shadow-[2px_8px_16px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleSignin} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="email"
                    className="form-label"
                  >
                    Email Address
                  </Label>
                  <Input 
                    ref={emailInputRef}
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
                  <div className="flex justify-between items-center">
                    <Label 
                      htmlFor="password"
                      className="form-label"
                    >
                      Password
                    </Label>
                    <Link href="#" className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide hover:text-[#1A1A1A]">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg font-bold uppercase tracking-[0.1em] text-[12px] shadow-lg shadow-[#5FD3BC]/20 flex items-center justify-center relative overflow-hidden disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors"
              >
                <span className={loading ? "opacity-0" : "opacity-100 transition-opacity"}>Sign In</span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" />
                  </div>
                )}
              </motion.button>

              <div className="pt-4 text-center">
                <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">
                  New to the Arena?{" "}
                  <Link href="/signup" className="text-[#1A1A1A] font-bold underline decoration-[#5FD3BC] decoration-2 underline-offset-4">
                    Create Account
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
