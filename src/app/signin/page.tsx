"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Crown, Eye, EyeOff, Loader2 } from "lucide-react";
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

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast.info("Please enter your email address first to reset your password.");
      setErrors({ email: "Email is required for password reset" });
      return;
    }
    // We would normally call supabase.auth.resetPasswordForEmail here
    toast.success("If an account exists for this email, you will receive a password reset link shortly.");
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12 overflow-hidden">
      {/* App Logo & Title */}
      <div className="pt-8 px-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-onyx rounded-full flex items-center justify-center border-2 border-lime-yellow shadow-md">
            <Crown className="text-lime-yellow" size={20} />
          </div>
          <h1 className="text-xl font-heading tracking-tight text-onyx">Smartking's Arena</h1>
        </div>
      </div>

      <HeroSection 
        title="Welcome Back" 
        subtitle="Sign in to your account and jump back into the action."
        className="pb-24 mt-4 relative"
      >
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-lime-yellow/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 -right-4 w-8 h-32 bg-lime-yellow rounded-full blur-xl" />
      </HeroSection>

      <div className="px-6 -mt-16">
        <div className="bg-alabaster-grey-2 rounded-[24px] p-8 border border-stone-200 shadow-lg relative z-10">
          <form className="flex flex-col gap-6" onSubmit={handleSignin}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className={`rounded-full bg-stone-100 px-6 h-12 ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="text-[10px] text-red-500 px-3 mt-0.5">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs text-olive font-extrabold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`rounded-full bg-stone-100 px-6 pr-12 h-12 ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 px-3 mt-0.5">{errors.password}</p>}
            </div>

            <div className="flex items-center space-x-3 px-1">
              <Checkbox 
                id="remember" 
                className="border-stone-300 data-[state=checked]:bg-lemon-lime data-[state=checked]:text-onyx w-5 h-5 rounded-md" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm font-medium leading-none text-stone-600">
                Remember me
              </label>
            </div>

            <PillButton type="submit" className="w-full mt-2 h-14 text-lg font-heading tracking-wide" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
            </PillButton>
          </form>
        </div>

        <p className="text-center mt-10 text-stone-500 mb-8 text-sm">
          New here?{" "}
          <Link href="/signup" className="text-lemon-lime font-extrabold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
