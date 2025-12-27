"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, isAdmin } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push("/");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Activity className="w-10 h-10 animate-pulse text-accent mx-auto" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-heading text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You don&apos;t have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
