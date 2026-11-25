"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PAYMENT_STATUS } from "@/constants/labels";
import { api } from "@/lib/api";
import { formatBillMonth, formatDateTime, formatTaka } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import type { Payment } from "@/types/api";

// Why the backend sent the customer to /payment/cancel
const CANCEL_REASON: Record<string, string> = {
  cancelled: "You cancelled the payment on the SSLCommerz page.",
  failed: "The payment failed at the bank or card provider.",
  validation_failed: "SSLCommerz could not confirm this payment, so it was not accepted.",
  missing_data: "The payment page did not send back the payment details.",
  unknown_transaction: "We could not find this transaction.",
  error: "Something went wrong while checking the payment.",
};

interface Props {
  kind: "success" | "cancel";
  tranId: string;
  reason?: string;
}

// Shows the REAL result from the backend (GET /payments/my-payments?transactionId=...).
// The backend has already verified the payment with SSLCommerz before redirecting here.
export function PaymentResult({ kind, tranId, reason }: Props) {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const isCustomer = user?.role === "CUSTOMER";

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payments", "result", tranId],
    queryFn: async () => (await api<Payment[]>("/payments/my-payments", { query: { transactionId: tranId, limit: 1 } })).data[0] ?? null,
    enabled: isCustomer && !!tranId,
    // If the payment is still PENDING, look again every 3 seconds (the IPN may arrive a moment later)
    refetchInterval: (query) => (query.state.data?.status === "PENDING" && query.state.dataUpdateCount < 10 ? 3000 : false),
  });

  const success = kind === "success" && (!payment || payment.status === "SUCCESS");
  const Icon = success ? CheckCircle2 : payment?.status === "PENDING" ? Clock : XCircle;

  return (
    <Card>
      <CardContent className="space-y-4 text-center">
        <Icon className={`mx-auto size-14 ${success ? "text-green-600" : payment?.status === "PENDING" ? "text-amber-500" : "text-red-500"}`} />
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            {payment?.status === "PENDING" ? "Payment is being confirmed" : success ? "Payment successful" : "Payment not completed"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {kind === "success"
              ? "Your electricity bill payment was verified with SSLCommerz."
              : (CANCEL_REASON[reason ?? ""] ?? "The payment was not completed. No money was taken for this attempt.")}
          </p>
        </div>

        {/* Real payment details for the logged-in customer */}
        {!ready || (isCustomer && isLoading) ? (
          <Skeleton className="mx-auto h-28 w-full" />
        ) : payment ? (
          <dl className="grid gap-3 rounded-lg bg-muted p-4 text-left text-sm sm:grid-cols-2">
            <Row label="Status" value={<StatusBadge {...PAYMENT_STATUS[payment.status]} />} />
            <Row label="Amount" value={formatTaka(payment.amount)} />
            <Row label="Bill" value={formatBillMonth(payment.bill.billMonth)} />
            <Row label="Paid at" value={payment.paidAt ? formatDateTime(payment.paidAt) : "-"} />
            {payment.cardType && <Row label="Method" value={payment.cardType} />}
            {payment.bankTransactionId && <Row label="Bank transaction" value={<span className="font-mono text-xs">{payment.bankTransactionId}</span>} />}
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Transaction ID</dt>
              <dd className="font-mono text-xs font-medium">{payment.transactionId}</dd>
            </div>
          </dl>
        ) : tranId ? (
          <p className="rounded-lg bg-muted p-3 text-sm">
            Transaction <span className="font-mono">{tranId}</span>
            {!user && " · Log in as the customer to see the payment details."}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2">
          {isCustomer ? (
            <>
              <Link href="/dashboard/bills" className={buttonVariants()}>
                {success ? "Back to my bills" : "Try again"}
              </Link>
              <Link href="/dashboard/payments" className={buttonVariants({ variant: "outline" })}>
                Payment history
              </Link>
            </>
          ) : (
            <Link href={user ? "/" : "/login"} className={buttonVariants()}>
              {user ? "Back to home" : "Log in"}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
