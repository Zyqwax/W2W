"use client";

import { Compass, Home, Inbox, LayoutList, LogOut, Search, Tv, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { collection, onSnapshot, query, where } from "@/lib/store-client";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db-client";
import { translate } from "@/lib/i18n";
import Avatar from "@/components/ui/Avatar";

const navItems = [
  { key: "home", href: "/", icon: Home },
  { key: "tv", href: "/tv", icon: Tv },
  { key: "discover", href: "/search", icon: Compass },
  { key: "lists", href: "/lists", icon: LayoutList },
  { key: "profile", href: "/profile", icon: User },
];

function activePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationItem({ item, pathname, label, compact = false }) {
  const Icon = item.icon;
  const active = activePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        compact && "min-h-14 flex-col justify-center gap-1 px-1 text-[10px]",
        active ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      <Icon size={compact ? 20 : 18} strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, language, logout } = useAuth();
  const [queryText, setQueryText] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const hidden = !user || pathname === "/login";

  useEffect(() => {
    if (!user) return undefined;
    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    return onSnapshot(chatsQuery, (snapshot) => {
      setHasUnread(snapshot.docs.some((chat) => chat.data().unreadBy?.includes(user.uid)));
    });
  }, [user]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = queryText.trim();
    if (value) {
      sessionStorage.setItem("w2w_searchQuery", value);
      if (pathname === "/search") window.dispatchEvent(new CustomEvent("w2w-search-query", { detail: value }));
    }
    router.push("/search");
    setQueryText("");
  };

  if (hidden) return null;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface px-5 py-6 lg:flex">
        <Link href="/" aria-label={t("nav.homeLink")} className="mb-10 flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Image src="/icon.svg" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-xl" priority />
          <span className="font-syne text-xl font-extrabold tracking-tight text-text">W2W</span>
        </Link>
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">{language === "en" ? "Your space" : "Alanım"}</p>
        <nav className="flex flex-col gap-1.5" aria-label={t("nav.main")}>
          {navItems.map((item) => <NavigationItem key={item.href} item={item} pathname={pathname} label={item.key === "tv" ? (language === "tr" ? "Diziler" : "Series") : t(`nav.${item.key}`)} />)}
        </nav>
        <Link href="/messages" className={clsx("mt-2 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-surface-2", activePath(pathname, "/messages") ? "bg-accent/10 text-accent" : "text-muted hover:text-text")}>
          <Inbox size={18} aria-hidden="true" />
          <span className="flex-1">{t("nav.messages")}</span>
          {hasUnread && <span className="h-2 w-2 rounded-full bg-accent-alt" aria-label={t("nav.unread")} />}
        </Link>
        <div className="mt-auto border-t border-border pt-4">
          <Link href="/profile" className="mb-3 flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
            <Avatar user={user} size={36} alt={user.displayName || t("nav.user")} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{user.displayName || t("nav.user")}</span>
          </Link>
          <button type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <LogOut size={17} aria-hidden="true" />{t("nav.logout")}
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-xl lg:left-64 lg:px-8">
        <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label={t("nav.homeLink")}>
          <Image src="/icon.svg" alt="" width={30} height={30} className="rounded-lg" priority />
          <span className="font-syne text-lg font-extrabold text-text">W2W</span>
        </Link>
        <div className="hidden min-w-0 flex-1 text-sm font-medium text-muted lg:block">{activePath(pathname, "/tv") ? (language === "tr" ? "Diziler" : "Series") : t(`nav.${navItems.find((item) => activePath(pathname, item.href))?.key || "home"}`)}</div>
        <form onSubmit={submitSearch} role="search" className="relative ml-auto flex h-11 w-[min(48vw,390px)] items-center gap-2 rounded-full border border-border bg-surface px-3 shadow-sm transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10 sm:w-[min(54vw,390px)] lg:ml-0 lg:px-4">
          <Search size={17} className="shrink-0 text-muted" aria-hidden="true" />
          <input value={queryText} onChange={(event) => setQueryText(event.target.value)} type="search" placeholder={t("nav.search")} aria-label={t("nav.search")} className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-faint" />
          <button type="submit" className="sr-only">{language === "en" ? "Search films" : "Film ara"}</button>
        </form>
        <Link href="/messages" aria-label={`${t("nav.messages")}${hasUnread ? `, ${t("nav.unread")}` : ""}`} className="relative ml-3 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Inbox size={19} aria-hidden="true" />
          {hasUnread && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent-alt" />}
        </Link>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-surface/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 backdrop-blur-xl lg:hidden" aria-label={t("nav.mobile")}>
        {navItems.map((item) => <NavigationItem key={item.href} compact item={item} pathname={pathname} label={item.key === "tv" ? (language === "tr" ? "Diziler" : "Series") : t(`nav.${item.key}`)} />)}
      </nav>
    </>
  );
}
