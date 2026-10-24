"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeLanguage } from "@/lib/i18n";

export default function LanguageSync() {
  const { language } = useAuth();

  useEffect(() => {
    document.documentElement.lang = normalizeLanguage(language);
  }, [language]);

  return null;
}
