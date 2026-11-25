import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoNotice } from "@/components/public/DemoNotice";
import { PaymentResult } from "@/components/public/PaymentResult";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Result of your electricity bill payment.",
  robots: { index: false },
};

// SSLCommerz -> backend (verifies the payment) -> redirects here with ?tran_id=...
export default function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 pt-28 pb-16">
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <Result searchParams={searchParams} />
      </Suspense>
      <DemoNotice>Payments use the SSLCommerz sandbox (test mode). Reporting an outage is always free.</DemoNotice>
    </div>
  );
}

// Reads ?tran_id from the URL on the server and passes it to the client component
async function Result({ searchParams }: { searchParams: PageProps<"/payment/success">["searchParams"] }) {
  const params = await searchParams;
  const tranId = typeof params.tran_id === "string" ? params.tran_id : "";
  return <PaymentResult kind="success" tranId={tranId} />;
}
