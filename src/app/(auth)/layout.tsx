import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <Image src="/logo.svg" alt="" width={36} height={36} priority />
        <span className="text-lg font-semibold text-primary">PowerGrid BD</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
        Demo authentication only. Accounts are stored in your browser and are not secure.
      </p>
    </main>
  );
}
