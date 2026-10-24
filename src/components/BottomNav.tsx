"use client";

import { Film, Home, LayoutList, LogOut, Menu, MessageSquare, Search, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@/context/NavigationContext";
import { db } from "@/lib/firebase";
import { getLanguageConfig, translate } from "@/lib/i18n";
import Avatar from "@/components/ui/Avatar";

const primaryNavItems = [
  { key: "home", href: "/", icon: Home },
  { key: "discover", href: "/search", icon: Search },
  { key: "lists", href: "/lists", icon: LayoutList },
  { key: "messages", href: "/messages", icon: MessageSquare },
  { key: "profile", href: "/profile", icon: User },
];

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function UserAvatar({ user, size = "default", className = "" }) {
  return (
    <Avatar
      user={user}
      size={size === "small" ? 32 : 40}
      alt={user?.displayName || user?.email || "User avatar"}
      className={clsx(
        "bg-accent/15 text-accent ring-1 ring-white/10 transition-all hover:ring-accent/50",
        className,
      )}
    />
  );
}

function NavigationLink({
  item,
  pathname,
  hasUnread,
  label,
  onNavigate,
  mobile = false,
}: {
  item: any;
  pathname: string;
  hasUnread: boolean;
  label: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={clsx(
        mobile
          ? "flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          : "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        mobile && active && "border-l-[3px] border-accent bg-white/[0.08] pl-[calc(0.75rem-3px)] text-text",
        mobile && !active && "text-muted hover:bg-white/[0.05] hover:text-text",
        !mobile && active && "bg-white/[0.07] text-text",
        !mobile && !active && "text-muted hover:bg-white/[0.05] hover:text-text",
      )}
    >
      <Icon size={mobile ? 16 : 17} className={clsx("shrink-0", mobile && active ? "text-accent" : "text-current")} aria-hidden="true" />
      <span className={mobile ? "flex-1" : undefined}>{label}</span>
      {item.href === "/messages" && hasUnread && <span className="h-1.5 w-1.5 rounded-full bg-accent-alt" aria-label="Unread messages" />}
    </Link>
  );
}

function MobileSidebar({ pathname, user, language, hasUnread, isOpen, onClose, onLogout }) {
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);

  return (
    <>
      <button
        type="button"
        aria-label={t("nav.closeMenu")}
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id="seyir-sidebar"
        aria-label={t("nav.sidebar")}
        aria-hidden={!isOpen}
        className={clsx(
          "fixed bottom-0 left-0 top-0 z-[60] flex w-72 flex-col border-r border-white/[0.07] bg-[#0a0a0f]/95 px-3 pb-4 backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-2">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="Seyir" width={28} height={28} className="h-7 w-7 rounded-lg" priority />
            <span className="font-syne text-base font-bold text-text">Seyir</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid min-h-8 min-w-8 place-items-center rounded-[var(--radius-sm)] text-muted transition-colors hover:bg-white/[0.07] hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t("nav.closeMenu")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 border-b border-white/[0.06] px-2 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <UserAvatar user={user} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text">{user.displayName || t("nav.user")}</span>
            <span className="mt-0.5 block truncate text-xs text-muted">{user.email}</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1 px-0 py-5" aria-label={t("nav.main")}>
          {primaryNavItems.map((item) => (
            <NavigationLink key={item.href} item={item} pathname={pathname} hasUnread={hasUnread} label={t(`nav.${item.key}`)} onNavigate={onClose} mobile />
          ))}
        </nav>

        <div className="mt-auto border-t border-white/[0.06] px-0 pt-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/[0.08] hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <LogOut size={16} aria-hidden="true" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, language, logout } = useAuth();
  const { mobileMenuOpen, setMobileMenuOpen, setSidebarOpen } = useNavigation();
  const [hasUnread, setHasUnread] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchRef = useRef(null);
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);
  const hidden = !user || pathname === "/login";

  useEffect(() => {
    if (!user) return undefined;
    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    return onSnapshot(chatsQuery, (snapshot) => {
      setHasUnread(snapshot.docs.some((chat) => chat.data().unreadBy?.includes(user.uid)));
    });
  }, [user]);

  useEffect(() => {
    const queryInput = searchInput.trim();
    if (!queryInput) return undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const { tmdb } = getLanguageConfig(language);
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(queryInput)}&language=${encodeURIComponent(tmdb)}&region=TR&page=1`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = await response.json();
        setSuggestions((data.results || []).filter((movie) => movie.title || movie.original_title).slice(0, 5));
      } catch (error) {
        if (error.name !== "AbortError") console.error("Header search suggestions error:", error);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [language, searchInput]);

  useEffect(() => {
    if (!suggestionsOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSuggestionsOpen(false);
    };
    const closeOnOutsidePointer = (event) => {
      if (!searchRef.current?.contains(event.target)) setSuggestionsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [suggestionsOpen]);

  const closeMenus = () => {
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  };

  const openMovieSuggestion = (movie) => {
    if (!movie?.id) return;
    setSuggestionsOpen(false);
    setSearchInput("");
    router.push(`/movie/${movie.id}`);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
  };

  if (hidden) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden h-14 items-center border-b border-border bg-surface px-6 shadow-sm lg:flex">
        <div className="flex h-full w-full items-center gap-6">
          <Link href="/" aria-label={t("nav.homeLink")} className="flex shrink-0 items-center gap-2.5 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Image src="/icon.svg" alt="Seyir" width={28} height={28} className="h-7 w-7 rounded-lg" priority />
            <span className="font-syne text-lg font-bold">Seyir</span>
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1" aria-label={t("nav.main")}>
            {primaryNavItems.map((item) => (
              <NavigationLink key={item.href} item={item} pathname={pathname} hasUnread={hasUnread} label={t(`nav.${item.key}`)} />
            ))}
          </nav>

          <div className="relative flex shrink-0 items-center gap-4">
            <form
              ref={searchRef}
              className="group relative flex h-8 w-48 items-center gap-2 rounded-[var(--radius-full)] border border-white/[0.08] bg-white/[0.06] px-3 text-muted transition-[width,background-color,border-color,box-shadow] duration-300 focus-within:w-72 focus-within:border-accent/50 focus-within:bg-white/[0.09] focus-within:shadow-[0_0_0_3px_var(--color-accent-glow)]"
              onSubmit={(event) => { event.preventDefault(); openMovieSuggestion(suggestions[0]); }}
            >
              <Search aria-hidden="true" size={14} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => { setSearchInput(event.target.value); setSuggestions([]); setSuggestionsOpen(true); }}
                onFocus={() => setSuggestionsOpen(true)}
                placeholder={t("nav.search")}
                aria-label={t("nav.search")}
                aria-autocomplete="list"
                aria-controls="header-search-suggestions"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-[--color-text-faint]"
              />
              {suggestionsOpen && searchInput.trim() && suggestions.length > 0 && (
                <div id="header-search-suggestions" role="listbox" className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-[70] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2 p-1.5 shadow-2xl shadow-black/40">
                  {suggestions.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-sm text-text hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      onClick={() => openMovieSuggestion(movie)}
                    >
                      <span
                        className="grid h-11 w-8 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-surface text-accent"
                        aria-hidden="true"
                        style={movie.poster_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w92${movie.poster_path})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
                      >
                        {!movie.poster_path && <Film size={14} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{movie.title || movie.original_title}</span>
                      {movie.release_date && <span className="shrink-0 text-xs text-muted">{movie.release_date.slice(0, 4)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </form>
            <Link href="/profile" aria-label={t("nav.profileLabel")} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <UserAvatar user={user} size="small" />
            </Link>
          </div>
        </div>
      </header>

      <button
        type="button"
        className="fixed left-4 top-3 z-[61] grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-white/[0.1] bg-white/[0.08] text-text backdrop-blur-sm transition-colors hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-controls="seyir-sidebar"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className={clsx("absolute transition-all duration-200 motion-reduce:transition-none", mobileMenuOpen ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} size={20} aria-hidden="true" />
        <X className={clsx("absolute transition-all duration-200 motion-reduce:transition-none", mobileMenuOpen ? "scale-100 rotate-0 opacity-100" : "-rotate-90 scale-75 opacity-0")} size={20} aria-hidden="true" />
      </button>

      <MobileSidebar
        pathname={pathname}
        user={user}
        language={language}
        hasUnread={hasUnread}
        isOpen={mobileMenuOpen}
        onClose={closeMenus}
        onLogout={handleLogout}
      />
    </>
  );
}

export { getInitials } from "@/components/ui/Avatar";
export { UserAvatar };
