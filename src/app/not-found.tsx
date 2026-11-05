import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

// Shown for any URL that does not exist, and when notFound() is called.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image src="/logo.svg" alt="" width={36} height={36} />
        <span className="text-lg font-semibold text-primary">PowerGrid BD</span>
      </Link>
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page could not be found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The address may be mistyped, or the page may have been moved. Here are some places to go instead.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className={buttonVariants()}>Go to home page</Link>
        <Link href="/outage-status" className={buttonVariants({ variant: "outline" })}>Check outage status</Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>Log in</Link>
      </div>
    </main>
  );
}
