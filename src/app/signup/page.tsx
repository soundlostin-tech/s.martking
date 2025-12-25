"use client";

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
import { Crown, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (countryCode === "+91" && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.terms) {
      newErrors.terms = "You must agree to the terms";
    }
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
        const isConfirmationRequired = !authData.session;

        if (isConfirmationRequired) {
          toast.success("Account created! Please check your email to confirm your account.");
          router.push("/signin");
          return;
        }

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: formData.fullname,
          phone: `${countryCode}${formData.phone}`,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        // Create wallet
        const { error: walletError } = await supabase.from("wallets").insert({
          id: authData.user.id,
          balance: 0,
        });

        if (walletError) {
          console.error("Wallet creation error:", walletError);
        }

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
        title="Create Account" 
        subtitle="Join the elite community of gamers and start winning today."
        className="pb-20 mt-4"
      />

      <div className="px-6 -mt-16">
        <div className="bg-alabaster-grey-2 rounded-[24px] p-8 border border-stone-200 shadow-lg relative z-10">
          <form className="flex flex-col gap-5" onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input 
                id="fullname" 
                placeholder="John Doe" 
                className={`rounded-full bg-stone-100 px-6 h-12 ${errors.fullname ? 'border-red-500' : ''}`}
                value={formData.fullname}
                onChange={(e) => {
                    setFormData({ ...formData, fullname: e.target.value });
                    if (errors.fullname) setErrors({ ...errors, fullname: "" });
                }}
              />
              {errors.fullname && <p className="text-[10px] text-red-500 px-3 mt-0.5">{errors.fullname}</p>}
            </div>
            
            {/* Email Address */}
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

            {/* Phone Number */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[90px] rounded-full bg-stone-100 h-12 px-4">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+971">+971</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="9876543210" 
                  className={`rounded-full bg-stone-100 px-6 h-12 flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                  value={formData.phone}
                  onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 px-3 mt-0.5">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
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

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`rounded-full bg-stone-100 px-6 pr-12 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 px-3 mt-0.5">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  className="mt-1 border-stone-300 data-[state=checked]:bg-lemon-lime data-[state=checked]:text-onyx w-5 h-5 rounded-md" 
                  checked={formData.terms}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, terms: checked as boolean });
                    if (errors.terms) setErrors({ ...errors, terms: "" });
                  }}
                />
                <label htmlFor="terms" className="text-sm font-medium leading-snug text-stone-600">
                  I agree to the <Link href="/terms" className="text-olive font-bold hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-olive font-bold hover:underline">Privacy Policy</Link>
                </label>
              </div>
              {errors.terms && <p className="text-[10px] text-red-500 px-3 mt-1">{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <PillButton type="submit" className="w-full mt-4 h-14 text-lg font-heading tracking-wide" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </PillButton>
          </form>
        </div>

        {/* Link to Signin */}
        <p className="text-center mt-10 text-stone-500 mb-8 text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-lemon-lime font-extrabold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
