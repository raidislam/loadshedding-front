"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CalendarClock, FilePlus, Info, Mail, MapPinned, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Outage status", href: "/outage-status" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const FOR_YOU = [
  { label: "Check schedules", href: "/outage-status", icon: CalendarClock },
  { label: "Report an outage", href: "/login", icon: FilePlus },
  { label: "Coverage areas", href: "/outage-status", icon: MapPinned },
  { label: "Get in touch", href: "/contact", icon: Mail },
];

// The home page is fully dark, the other public pages are light,
// so the footer follows whichever theme the page around it uses.
const THEMES = {
  dark: {
    footer: "bg-[#020617] text-slate-300",
    grid: "hero-grid-bg opacity-50",
    glowA: "bg-electric/15",
    glowB: "bg-indigo-600/15",
    bolt: "text-sky-400/5",
    logoChip: "bg-white/5 ring-sky-400/30 shadow-electric/30",
    brand: "text-white",
    accent: "text-sky-400",
    heading: "text-white",
    body: "text-slate-400",
    link: "text-slate-400 hover:text-sky-300",
    icon: "text-sky-400/80",
    card: "border-white/10 bg-white/3",
    notice: "text-amber-300",
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    divider: "border-white/10",
    bottom: "text-slate-500",
  },
  light: {
    footer: "border-t bg-card text-foreground",
    grid: "footer-grid-light",
    glowA: "bg-electric/10",
    glowB: "bg-indigo-400/10",
    bolt: "text-electric/5",
    logoChip: "bg-primary ring-electric/20 shadow-electric/20",
    brand: "text-primary",
    accent: "text-electric",
    heading: "text-primary",
    body: "text-muted-foreground",
    link: "text-muted-foreground hover:text-electric",
    icon: "text-electric",
    card: "border-border bg-background/70",
    notice: "text-amber-700",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    divider: "border-border",
    bottom: "text-muted-foreground",
  },
};

export function PublicFooter() {
  const pathname = usePathname();
  const t = pathname === "/" ? THEMES.dark : THEMES.light;

  return (
    <footer className={cn("relative mt-auto overflow-hidden", t.footer)}>
      {/* Glowing "live wire" along the top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-400/70 to-transparent" />
      <div className="pg-line absolute inset-x-0 top-0 h-0.5 opacity-60" />

      {/* Background energy */}
      <div className={cn("hero-grid-mask pointer-events-none absolute inset-0", t.grid)} />
      <div className={cn("pointer-events-none absolute -top-24 left-1/4 size-96 rounded-full blur-3xl", t.glowA)} />
      <div className={cn("pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full blur-3xl", t.glowB)} />
      <Zap
        className={cn("pointer-events-none absolute -bottom-16 -left-10 size-72", t.bolt)}
        strokeWidth={1}
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        {/* Brand */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className={cn("flex size-10 items-center justify-center rounded-xl shadow-lg ring-1", t.logoChip)}>
              <Image src="/logo.svg" alt="" width={26} height={26} />
            </span>
            <span className={cn("text-lg font-bold", t.brand)}>
              PowerGrid <span className={t.accent}>BD</span>
            </span>
          </Link>
          <p className={cn("mt-4 max-w-xs text-sm leading-relaxed", t.body)}>
            Load Shedding &amp; Power Management System. A student project that demonstrates how
            outages, reports and repairs can be managed in one place.
          </p>
          <div className={cn("mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", t.badge)}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Demo grid online
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className={cn("text-sm font-semibold uppercase tracking-wider", t.heading)}>Quick links</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={cn("group inline-flex items-center gap-1 transition-colors", t.link)}>
                  {l.label}
                  <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer actions */}
        <div>
          <p className={cn("text-sm font-semibold uppercase tracking-wider", t.heading)}>For customers</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOR_YOU.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={cn("inline-flex items-center gap-2 transition-colors", t.link)}>
                  <l.icon className={cn("size-4", t.icon)} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Demo notice */}
        <div className={cn("rounded-2xl border p-5 backdrop-blur", t.card)}>
          <p className={cn("inline-flex items-center gap-2 text-sm font-semibold", t.notice)}>
            <Info className="size-4" />
            Demo notice
          </p>
          <p className={cn("mt-2 text-sm leading-relaxed", t.body)}>
            All outages, schedules and customer data shown here are sample data created for an
            academic assignment. This is not a live feed from any electricity authority.
          </p>
        </div>
      </div>

      <div className={cn("relative border-t", t.divider)}>
        <div className={cn("mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row", t.bottom)}>
          <p>© 2026 PowerGrid BD · Academic demonstration project</p>
          <p className="inline-flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-400" />
            Powering Bangladesh, one feeder at a time
          </p>
        </div>
      </div>
    </footer>
  );
}
