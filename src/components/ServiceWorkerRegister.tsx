"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            if (
              registration.active?.scriptURL ===
              new URL("/sw.js", window.location.origin).href
            )
              void registration.unregister();
          }
        });
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith("w2w-shell-"))
                .map((key) => caches.delete(key)),
            ),
          );
        return;
      }
      const register = () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
      };
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
