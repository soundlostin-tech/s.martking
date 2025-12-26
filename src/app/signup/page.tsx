"use client";

import { motion } from "framer-motion";
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
import { Loader2, Star, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaperWrapper } from "@/components/layout/PaperWrapper";

export default function Signup() {
  const [loading, setLoading] = useState(false);
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
    if (!formData.fullname.trim()) newErrors.fullname = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (formData.password.length < 6) newErrors.password = "Min 6 chars";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!formData.terms) newErrors.terms = "Required";
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
          user_id: authData.user.id,
          balance: 0,
        });

        toast.success("Identity created!");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PaperWrapper className="!rotate-1">
        <div className="space-y-8 py-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 border-2 border-[#000033] rounded-3xl flex items-center justify-center rotate-3 shadow-sm">
              <Star size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl m-0">Join Arena</h1>
              <p className="text-xl opacity-60">Create your warrior identity</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Agent Name</Label>
              <Input 
                placeholder="Full Name" 
                className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
              {errors.fullname && <p className="text-xs text-red-500 ml-1">{errors.fullname}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Email</Label>
              <Input 
                type="email" 
                placeholder="warrior@arena.com" 
                className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Signal Connection</Label>
              <div className="flex gap-3">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[100px] h-14 border-2 border-[#000033]/10 rounded-2xl font-bold text-xl bg-transparent">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#000033]">
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="9876543210" 
                  className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30 flex-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Protocol</Label>
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Confirm</Label>
                <Input 
                  type="password" 
                  placeholder="Confirm" 
                  className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 px-1">
              <Checkbox 
                id="terms" 
                className="w-5 h-5 rounded-md border-[#000033]/20" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-xs font-bold opacity-40 uppercase tracking-widest cursor-pointer">
                I accept the terms
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-hand-drawn w-full py-4 bg-[#000033] text-white"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Enlist Now"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xl opacity-60">
              Already enlisted?{" "}
              <Link href="/signin" className="text-[#000033] font-bold underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </PaperWrapper>
    </div>
  );
}
