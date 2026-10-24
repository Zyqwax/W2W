"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLanguage(DEFAULT_LANGUAGE);
      setRegion(DEFAULT_REGION);

      if (nextUser) {
        try {
          const userRef = doc(db, "users", nextUser.uid);
          const profileSnap = await getDoc(userRef);
          const profile = profileSnap.exists() ? profileSnap.data() : {};
          setLanguage(normalizeLanguage(profile.language));
          setRegion(normalizeRegion(profile.region));

          // Save basic profile info without replacing existing preferences.
          await setDoc(userRef, {
            uid: nextUser.uid,
            displayName: nextUser.displayName,
            photoURL: nextUser.photoURL,
            email: nextUser.email,
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
