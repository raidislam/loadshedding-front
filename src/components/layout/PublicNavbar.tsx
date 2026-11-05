"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/layout/AuthProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ROLE_HOME } from "@/constants/navigation";
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

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
    </header>
  );
}
