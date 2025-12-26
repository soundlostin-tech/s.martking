"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Swords, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaperWrapper } from "@/components/layout/PaperWrapper";

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
      newErrors.email = "Invalid format";
    }
    if (!formData.password) {
      newErrors.password = "Required";
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
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
    } catch (error: any) {
      toast.error("Signin failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PaperWrapper className="!rotate-1">
        <div className="space-y-10 py-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 border-2 border-[#000033] rounded-3xl flex items-center justify-center rotate-3 shadow-sm">
              <Swords size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl m-0">Arena Login</h1>
              <p className="text-xl opacity-60">Ready for battle?</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignin}>
            <div className="space-y-2">
              <Label className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">Deployment Email</Label>
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
              <div className="flex justify-between items-center px-1">
                <Label className="text-xs font-bold opacity-40 uppercase tracking-widest">Access Protocol</Label>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="h-14 border-2 border-[#000033]/10 rounded-2xl px-6 text-xl bg-transparent focus:border-[#000033]/30"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000033]/20 hover:text-[#000033] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-hand-drawn w-full py-4 bg-[#000033] text-white"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Establish Uplink"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xl opacity-60">
              New Warrior?{" "}
              <Link href="/signup" className="text-[#000033] font-bold underline">
                Join Arena
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4 opacity-20">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Fast Link</span>
            </div>
          </div>
        </div>
      </PaperWrapper>
    </div>
  );
}
