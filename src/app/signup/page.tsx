"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

        if (authData.user) {
          // Check if session is null (means email confirmation is required)
          const isConfirmationRequired = !authData.session;

          // Create profile (use service role or public depending on RLS, but usually user can insert their own profile)
          // Wait, if session is null, the user is not authenticated yet.
          // In some Supabase setups, you can't insert into profiles if not authenticated.
          // However, let's assume it works or we should inform them.

          if (isConfirmationRequired) {
            toast.success("Account created! Please check your email to confirm your account.");
            router.push("/signin");
            return;
          }

          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            full_name: formData.fullname,
            phone: formData.phone,
          });

          if (profileError) throw profileError;

          // Create wallet
          const { error: walletError } = await supabase.from("wallets").insert({
            id: authData.user.id,
            balance: 0,
          });

          if (walletError) throw walletError;

          toast.success("Account created successfully!");
          router.push("/");
        }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 pb-12">
      <HeroSection 
        title="Join the Arena" 
        subtitle="Create your Smartking's Arena account."
        className="pb-20"
      >
        <div className="flex justify-center -mb-32 mt-4">
          <div className="w-20 h-20 bg-onyx rounded-full flex items-center justify-center border-4 border-lime-yellow shadow-xl relative z-30">
            <Crown className="text-lime-yellow" size={40} />
          </div>
        </div>
      </HeroSection>

      <div className="px-6 mt-16">
        <div className="bg-alabaster-grey-2 rounded-[24px] p-8 border border-stone-200 shadow-lg">
          <form className="flex flex-col gap-6" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input 
                id="fullname" 
                placeholder="Enter your full name" 
                className="rounded-full bg-stone-100 px-6"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                required
              />
            </div>
            
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
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="bg-stone-100 px-4 py-2 rounded-full border border-stone-200 text-sm flex items-center">+91</div>
                <Input 
                  id="phone" 
                  placeholder="98765 43210" 
                  className="rounded-full bg-stone-100 px-6 flex-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full bg-stone-100 px-6"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-full bg-stone-100 px-6"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" className="border-stone-400 data-[state=checked]:bg-lemon-lime data-[state=checked]:text-onyx" required />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to <span className="text-olive underline">Terms & Conditions</span>
              </label>
            </div>

            <PillButton type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </PillButton>
          </form>
        </div>

        <p className="text-center mt-8 text-stone-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-lemon-lime font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
