import { Film } from "lucide-react";
import Image from "next/image";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.549L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.609L5.27028 9.704C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
      <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
      <path d="M5.265 14.295C5.025 13.57 4.885 12.8 4.885 12C4.885 11.2 5.02 10.43 5.265 9.705L1.275 6.61C.46 8.23 0 10.06 0 12S.46 15.77 1.28 17.39L5.265 14.295Z" fill="#FBBC05" />
      <path d="M12 24C15.24 24 17.965 22.935 19.945 21.095L16.08 18.095C15.005 18.82 13.62 19.245 12 19.245C8.87 19.245 6.215 17.135 5.265 14.29L1.275 17.385C3.255 21.31 7.31 24 12 24Z" fill="#34A853" />
    </svg>
  );
}

export default function LoginView({ onLogin, t }) {
  return (
    <main className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-border lg:flex" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,var(--color-accent-glow),transparent_30%),radial-gradient(circle_at_78%_78%,rgb(255_101_132_/_18%),transparent_28%),linear-gradient(145deg,var(--color-surface),var(--color-bg)_68%)]" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent-alt/10 blur-3xl" />
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Seyir Logo" width={44} height={44} className="h-11 w-11 rounded-xl" priority />
            <span className="font-syne text-lg font-bold text-text">Seyir</span>
          </div>
          <div className="max-w-lg">
            <Film size={42} className="mb-6 text-accent" strokeWidth={1.5} />
            <p className="mb-4 text-sm font-semibold text-accent">Kendi film arşivin</p>
            <h2 className="font-syne text-5xl font-bold leading-[1.05] text-text xl:text-6xl">
              İzlediklerini hatırla, sıradakini keşfet.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">Filmlerini, listelerini ve izleme anılarını tek yerde tut.</p>
        </div>
      </section>

      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 lg:hidden">
          <Image src="/icon.svg" alt="Seyir Logo" width={40} height={40} className="h-10 w-10 rounded-xl" priority />
          <span className="font-syne text-base font-bold text-text">Seyir</span>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-accent">Hoş geldin</p>
            <h1 className="font-syne text-3xl font-bold leading-tight text-text sm:text-4xl">Film arşivine giriş yap.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{t("auth.description")}</p>
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] bg-white px-5 text-sm font-semibold text-black transition-[background-color,transform] hover:-translate-y-px hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <GoogleMark />
            {t("auth.google")}
          </button>

          <div className="mt-8 flex items-center gap-3 text-xs text-faint">
            <span className="h-px flex-1 bg-border" />
            <span>Güvenli giriş</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>

        <footer className="mx-auto w-full max-w-md text-center text-xs leading-5 text-muted">
          {t("auth.privacy")}
        </footer>
      </section>
    </main>
  );
}
