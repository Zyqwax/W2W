"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { db } from "@/lib/db-client";
import { doc, getDoc, setDoc, serverTimestamp } from "@/lib/store-client";
import { DEFAULT_LANGUAGE, DEFAULT_REGION, normalizeLanguage, normalizeRegion } from "@/lib/i18n";
import type { AuthContextType, LanguageCode, RegionCode } from "@/types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  language: DEFAULT_LANGUAGE,
  region: DEFAULT_REGION,
  updatePreferences: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const sessionState = authClient.useSession();
  const session = sessionState.data as unknown as { user: { id: string; name: string; email: string; image?: string | null } } | null;
  const isPending = sessionState.isPending;
  const rawUser = session?.user;
  const user = useMemo(() => rawUser ? ({
    ...rawUser,
    uid: rawUser.id,
    displayName: rawUser.name,
    photoURL: rawUser.image,
  }) as AuthContextType["user"] : null, [rawUser]);
  const [profileLoading, setProfileLoading] = useState(true);
  const loading = isPending || profileLoading;
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLanguage(DEFAULT_LANGUAGE);
      setRegion(DEFAULT_REGION);

      try {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const profileSnap = await getDoc(userRef);
          const profile = profileSnap.exists() ? profileSnap.data() : {};
          if (active) {
            setLanguage(normalizeLanguage(profile.language));
            setRegion(normalizeRegion(profile.region));
          }

          // Save basic profile info without replacing existing preferences.
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            lastSeen: serverTimestamp()
          }, { merge: true });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    if (!isPending) {
      setProfileLoading(true);
      void loadProfile();
    }
    return () => { active = false; };
  }, [isPending, rawUser, user]);

  const loginWithGoogle = async () => {
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/" });
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updatePreferences = async (preferences: { language?: string; region?: string }) => {
    if (!user) throw new Error("Not authenticated");

    const nextLanguage = normalizeLanguage(preferences.language ?? language);
    const nextRegion = normalizeRegion(preferences.region ?? region);
    const previous = { language, region };
    setLanguage(nextLanguage);
    setRegion(nextRegion);

    try {
      await setDoc(doc(db, "users", user.uid), {
        language: nextLanguage,
        region: nextRegion,
      }, { merge: true });
    } catch (error) {
      setLanguage(previous.language);
      setRegion(previous.region);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, language, region, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};
