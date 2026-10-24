"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_LANGUAGE, translate } from "@/lib/i18n";
import LoginView from "@/components/pages/login/LoginView";

// ── Controller ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const t = (key: string, values?: Record<string, any>) => translate(DEFAULT_LANGUAGE, key, values);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" role="status" aria-label="Loading" />
      </div>
    );
  if (user) return null;

  return <LoginView onLogin={loginWithGoogle} t={t} />;
}
