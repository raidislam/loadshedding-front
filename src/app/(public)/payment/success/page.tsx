import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { DashboardLink } from "@/components/public/DashboardLink";
import { DemoNotice } from "@/components/public/DemoNotice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Successful (Demo)",
  description: "Demonstration page for a successful payment. No real payment is made in this project.",
  robots: { index: false },
  openGraph: { title: "Payment Successful (Demo) | PowerGrid BD", description: "Demonstration page only.", type: "website" },
};

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-16">
      <Card>
        <CardContent className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto size-14 text-green-600" />
          <div>
            <h1 className="text-2xl font-semibold text-primary">Payment successful</h1>
            <p className="mt-1 text-muted-foreground">
              This is where a customer would land after paying an electricity bill online.
            </p>
          </div>
          <p className="rounded-lg bg-muted p-3 text-sm">
            <strong>Demonstration page.</strong> No payment was made and no money was charged. Bill payment
            is not part of this frontend phase and may be added with the backend later.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className={buttonVariants()}>Back to home</Link>
            <DashboardLink />
          </div>
        </CardContent>
      </Card>
      <DemoNotice>Outage reports and repairs in this system are free. They never involve a payment.</DemoNotice>
    </div>
  );
}
