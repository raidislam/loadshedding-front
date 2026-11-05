import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { DashboardLink } from "@/components/public/DashboardLink";
import { DemoNotice } from "@/components/public/DemoNotice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Cancelled (Demo)",
  description: "Demonstration page for a cancelled payment. No real payment is made in this project.",
  robots: { index: false },
  openGraph: { title: "Payment Cancelled (Demo) | PowerGrid BD", description: "Demonstration page only.", type: "website" },
};

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-16">
      <Card>
        <CardContent className="space-y-4 text-center">
          <XCircle className="mx-auto size-14 text-amber-500" />
          <div>
            <h1 className="text-2xl font-semibold text-primary">Payment cancelled</h1>
            <p className="mt-1 text-muted-foreground">
              This is where a customer would land after leaving the payment screen without paying.
            </p>
          </div>
          <p className="rounded-lg bg-muted p-3 text-sm">
            <strong>Demonstration page.</strong> Nothing was charged, because no payment was started. You
            can safely go back.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className={buttonVariants()}>Back to home</Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Contact support</Link>
            <DashboardLink />
          </div>
        </CardContent>
      </Card>
      <DemoNotice />
    </div>
  );
}
