"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { isDarkPublicRoute, ROLE_HOME } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Outage Status", href: "/outage-status" },
  { label: "Contact", href: "/contact" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Dark pages float the navbar over their content as a dark rounded pill
  const isDark = isDarkPublicRoute(pathname);

  // Once the page scrolls, the pill tightens up and becomes more solid
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function linkClass(href: string, dark = false) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    if (dark) {
      return cn(
        "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
        active
          ? "bg-linear-to-r from-electric/30 to-indigo-500/30 text-white shadow-[inset_0_0_0_1px_rgb(125_211_252/0.35)]"
          : "text-slate-300 hover:bg-white/6 hover:text-white",
      );
    }
    return cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-accent text-primary" : "text-muted-foreground hover:text-primary",
    );
  }

  // Right side buttons: dashboard link when logged in, otherwise Login / Register
  const authButtons = !ready ? null : user ? (
    <Link href={ROLE_HOME[user.role]} className={buttonVariants({ size: "lg" })}>
      Go to dashboard
    </Link>
  ) : (
    <>
      <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
        Login
      </Link>
      <Link href="/register" className={buttonVariants({ size: "lg" })}>
        Register
      </Link>
    </>
  );

  const darkAuthButtons = !ready ? null : user ? (
    <Link
      href={ROLE_HOME[user.role]}
      className="inline-flex h-9 items-center rounded-full bg-electric px-4 text-sm font-semibold text-white shadow-lg shadow-electric/40 transition hover:brightness-110"
    >
      Go to dashboard
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-slate-200 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center rounded-full bg-electric px-4 text-sm font-semibold text-white shadow-lg shadow-electric/40 transition hover:brightness-110"
      >
        Register
      </Link>
    </>
  );

  const mobileMenu = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 px-4" onClick={() => setOpen(false)}>
          {authButtons}
        </div>
      </SheetContent>
    </Sheet>
  );

  if (isDark) {
    return (
      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "relative mx-auto flex items-center justify-between rounded-full border pr-2 pl-4 backdrop-blur-xl transition-all duration-500 sm:pl-5",
            scrolled
              ? "h-12 max-w-5xl border-sky-400/20 bg-[#030a1f]/90 shadow-2xl shadow-electric/20"
              : "h-14 max-w-6xl border-white/10 bg-[#050d24]/60 shadow-2xl shadow-black/40",
          )}
        >
          {/* Thin glowing edge along the top of the pill */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-sky-400/60 to-transparent" />

          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={30} height={30} priority />
            <span className="font-semibold text-white">
              PowerGrid <span className="text-sky-400">BD</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href, true)}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">{darkAuthButtons}</div>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
        {mobileMenu}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={32} height={32} priority />
          <span className="font-semibold text-primary">PowerGrid BD</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">{authButtons}</div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
      </div>

      {mobileMenu}
    </header>
  );
}
