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
import { Crown, Loader2, Eye, EyeOff, Star, Swords, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    <main className="min-h-screen bg-yale-blue bg-[radial-gradient(circle_at_50%_0%,_#355070_0%,_#304966_100%)] flex items-center justify-center p-6 relative overflow-hidden py-24">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-light-coral/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[3rem] overflow-hidden animate-fadeIn"
      >
        <div className="bg-dusk-blue p-10 border-b border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-light-coral text-white rounded-2xl flex items-center justify-center shadow-xl shadow-light-coral/20 mb-2">
              <Star size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-light-coral uppercase tracking-[0.4em]">Warrior Enrollment</h4>
              <h1 className="text-4xl font-heading text-white leading-tight">
                Create <span className="italic font-serif text-white/60">Identity.</span>
              </h1>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-light-coral/20 blur-[80px] rounded-full" />
        </div>

        <div className="p-10 md:p-12 space-y-8">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Agent Name</Label>
              <Input 
                placeholder="FULL NAME" 
                className="h-14 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-light-coral placeholder:text-white/10"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Deployment Email</Label>
              <Input 
                type="email" 
                placeholder="WARRIOR@ARENA.COM" 
                className="h-14 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-light-coral placeholder:text-white/10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Signal Connection</Label>
              <div className="flex gap-3">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[100px] h-14 rounded-[2rem] border-none bg-white/5 font-bold text-xs text-white">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="bg-dusk-blue border-white/10 text-white rounded-2xl">
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="9876543210" 
                  className="h-14 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-light-coral placeholder:text-white/10 flex-1"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Access Protocol</Label>
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  className="h-14 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-light-coral placeholder:text-white/10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-4">Confirm Keys</Label>
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  className="h-14 px-8 rounded-[2rem] border-none bg-white/5 shadow-inner text-white font-bold text-xs tracking-wide focus-visible:ring-light-coral placeholder:text-white/10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4 py-2">
              <Checkbox 
                id="terms" 
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 data-[state=checked]:bg-light-coral data-[state=checked]:text-white" 
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-[10px] font-bold text-white/40 uppercase tracking-widest cursor-pointer">
                I ACCEPT THE <span className="text-light-coral">TERMS OF ENGAGEMENT</span>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[2rem] bg-light-coral hover:bg-light-coral/90 text-white font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-light-coral/20 mt-2 border-none" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ENLIST IN ARENA"}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              ALREADY ENLISTED?{" "}
              <Link href="/signin" className="text-light-coral hover:text-white transition-colors">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="bg-white/[0.02] p-6 flex items-center justify-center gap-8 border-t border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-light-coral" />
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-light-coral" />
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">FAST UPLINK</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
