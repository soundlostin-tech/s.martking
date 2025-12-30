"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  country: string | null;
  win_rate: number;
  matches_played: number;
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      }
      
      setLoading(false);

      if (requireAuth && !session) {
        router.push("/signin");
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      
      if (requireAuth && !session) {
        router.push("/signin");
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, router]);

  const isAdmin = profile?.role === "Admin" || profile?.role === "Organizer";

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return { user, profile, loading, isAdmin, signOut };
}
