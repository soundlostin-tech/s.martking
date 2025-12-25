"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/layout/HeroSection";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Crown, Eye, EyeOff, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Details */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />

      {/* Auth Card */}
      <div className="relative max-w-lg w-full bg-white/30 backdrop-blur-xl border border-zinc-200/0 shadow-2xl rounded-[3rem] px-8 py-12 md:px-12 md:py-16 animate-fadeIn">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
                <Crown size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-heading text-black leading-tight tracking-tight">
              Welcome <span className="italic">Back.</span>
            </h1>
            <p className="text-lg font-serif text-zinc-600">
              Sign in to continue your dominance.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="warrior@arena.com" 
                className={`h-16 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg text-black font-serif ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="text-[10px] text-red-500 px-6 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <Label htmlFor="password" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
                <button type="button" className="text-[10px] text-black/40 hover:text-black font-bold uppercase tracking-wider transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`h-16 px-8 pr-16 rounded-full border-zinc-200 bg-white/60 shadow-lg text-black font-serif ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 px-6 mt-1">{errors.password}</p>}
            </div>

            <PillButton type="submit" className="w-full h-16 text-lg font-serif shadow-2xl" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enter the Arena"}
            </PillButton>
          </form>

          <p className="text-center text-sm font-serif text-zinc-500">
            New to the arena?{" "}
            <Link href="/signup" className="text-black font-bold underline underline-offset-4 decoration-black/10 hover:decoration-black">
              Create identity
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
