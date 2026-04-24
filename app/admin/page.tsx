"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pinChecked, setPinChecked] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("pinVerified") === "1";
    if (!verified) {
      router.replace("/");
    } else {
      setPinVerified(true);
    }
    setPinChecked(true);
  }, [router]);

  // Spinner while checking PIN session or Firebase auth
  if (!pinChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect in progress
  if (!pinVerified) return null;

  // PIN done this session but Firebase session expired → re-authenticate
  if (!user) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
