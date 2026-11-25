import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { PaymentResult } from "@/components/public/PaymentResult";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment Not Completed",
  description: "Your electricity bill payment was cancelled or failed.",
  robots: { index: false },
};

// The backend redirects here when a payment is cancelled, fails, or can't be verified:
// /payment/cancel?tran_id=...&reason=cancelled|failed|validation_failed|...
export default function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 pt-28 pb-16">
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <Result searchParams={searchParams} />
      </Suspense>
      <DemoNotice>Payments use the SSLCommerz sandbox (test mode). No real money is charged.</DemoNotice>
    </div>
  );
}

async function Result({ searchParams }: { searchParams: PageProps<"/payment/cancel">["searchParams"] }) {
  const params = await searchParams;
  const tranId = typeof params.tran_id === "string" ? params.tran_id : "";
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  return <PaymentResult kind="cancel" tranId={tranId} reason={reason} />;
}
