"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
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

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 overflow-hidden">
      <HeroSection 
        title="Welcome Back" 
        subtitle="Sign in to control your arena."
        className="pb-24 relative"
      >
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-lime-yellow/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 -right-4 w-8 h-32 bg-lime-yellow rounded-full blur-xl" />
      </HeroSection>

      <div className="px-6 mt-8">
        <div className="bg-alabaster-grey-2 rounded-[24px] p-8 border border-stone-200 shadow-lg relative z-10">
          <form className="flex flex-col gap-6" onSubmit={handleSignin}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="rounded-full bg-stone-100 px-6"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-lemon-lime font-bold">Forgot password?</button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="rounded-full bg-stone-100 px-6 pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <PillButton type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </PillButton>
          </form>
        </div>

        <p className="text-center mt-8 text-stone-500">
          New here?{" "}
          <Link href="/signup" className="text-lemon-lime font-bold">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
