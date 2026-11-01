"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function MainContentWrapper({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  return (
    <main
      className={clsx(
        "min-w-0 w-full flex-1 transition-[margin] duration-200",
        !isLogin && "pt-[68px] pb-24 lg:ml-64 lg:w-[calc(100%-16rem)] lg:pb-8",
      )}
    >
      {children}
    </main>
  );
}
