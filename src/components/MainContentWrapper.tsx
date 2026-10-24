"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function MainContentWrapper({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  return (
    <main
      className={clsx(
        "mx-auto min-w-0 w-full max-w-7xl flex-1 transition-[margin] duration-200",
        !isLogin && "pt-16 lg:pt-14",
      )}
    >
      {children}
    </main>
  );
}
