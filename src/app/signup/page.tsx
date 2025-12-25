"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/layout/HeroSection";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Crown, Loader2, Eye, EyeOff, Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (formData.password.length < 6) newErrors.password = "Min 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!formData.terms) newErrors.terms = "Accept terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullname,
            phone: `${countryCode}${formData.phone}`,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: formData.fullname,
          phone: `${countryCode}${formData.phone}`,
        });
        await supabase.from("wallets").insert({
          id: authData.user.id,
          balance: 0,
        });

        toast.success("Account created successfully!");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6 relative overflow-hidden py-20">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 blur-[120px] rounded-full" />

      <div className="relative max-w-lg w-full bg-white/30 backdrop-blur-xl border border-zinc-200/0 shadow-2xl rounded-[3rem] px-8 py-12 md:px-12 animate-fadeIn">
        <div className="flex flex-col space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
                <Star size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-heading text-black leading-tight tracking-tight">
              Create <span className="italic">Identity.</span>
            </h1>
            <p className="text-lg font-serif text-zinc-600">
              Join the elite circle of warriors.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Agent Name</Label>
              <Input 
                placeholder="Full Name" 
                className="h-14 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg font-serif"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Email Address</Label>
              <Input 
                type="email" 
                placeholder="warrior@arena.com" 
                className="h-14 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg font-serif"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[100px] h-14 rounded-full border-zinc-200 bg-white/60 shadow-lg">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="9876543210" 
                  className="h-14 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg font-serif flex-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  className="h-14 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg font-serif"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">Confirm</Label>
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  className="h-14 px-8 rounded-full border-zinc-200 bg-white/60 shadow-lg font-serif"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4">
              <Checkbox 
                id="terms" 
                className="w-5 h-5 rounded-md border-zinc-300" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-xs font-serif text-zinc-500">
                I accept the <span className="text-black font-bold">Terms of Engagement</span>
              </label>
            </div>

            <PillButton type="submit" className="w-full h-16 text-lg font-serif shadow-2xl mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enlist Now"}
            </PillButton>
          </form>

          <p className="text-center text-sm font-serif text-zinc-500">
            Already enlisted?{" "}
            <Link href="/signin" className="text-black font-bold underline underline-offset-4 decoration-black/10 hover:decoration-black">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
