"use client";

import { useMutation } from "@tanstack/react-query";
import { CreditCard, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BILL_STATUS, toOptions } from "@/constants/labels";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import { formatBillMonth, formatDate, formatTaka } from "@/lib/format";
import type { Bill, InitiatePaymentResult } from "@/types/api";

export function MyBills() {
  const { get, page } = useUrlFilters();
  const [paying, setPaying] = useState<Bill | null>(null);

  // GET /bills/my-bills - only this customer's bills, newest month first
  const { data, isLoading, error } = useList<Bill>("bills/my-bills", { page, limit: 10, status: get("status") || undefined });

  // POST /payments/initiate -> SSLCommerz sandbox page. We send the browser there.
  const pay = useMutation({
    mutationFn: (bill: Bill) => api<InitiatePaymentResult>("/payments/initiate", { method: "POST", body: { billId: bill.id } }),
    onSuccess: ({ data: result }) => {
      toast.success(result.reused ? "Continuing your unfinished payment..." : "Opening the secure SSLCommerz payment page...");
      window.location.href = result.gatewayUrl; // external site (SSLCommerz)
    },
    onError: (e) => {
      toast.error(errorMessage(e));
      setPaying(null);
    },
  });

  const unpaid = (data?.data ?? []).filter((b) => b.status === "UNPAID");

  const columns: Column<Bill>[] = [
    { header: "Month", cell: (b) => <span className="font-medium">{formatBillMonth(b.billMonth)}</span> },
    { header: "Units", cell: (b) => `${b.unitsConsumed} kWh`, className: "hidden sm:table-cell" },
    { header: "Amount", cell: (b) => <span className="font-medium">{formatTaka(b.amount)}</span> },
    { header: "Due date", cell: (b) => formatDate(b.dueDate), className: "hidden md:table-cell" },
    { header: "Status", cell: (b) => <StatusBadge {...BILL_STATUS[b.status]} /> },
    {
      header: "Pay",
      className: "text-right",
      cell: (b) =>
        b.status === "UNPAID" ? (
          <Button size="sm" onClick={() => setPaying(b)} disabled={pay.isPending}>
            <CreditCard /> Pay now
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Paid {b.paidAt ? formatDate(b.paidAt) : ""}</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Bills"
        description="Pay your electricity bill online with card or mobile banking (SSLCommerz)."
        actions={
          <Link href="/dashboard/payments" className={buttonVariants({ variant: "outline" })}>
            <History /> Payment history
          </Link>
        }
      />

      {unpaid.length > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="text-sm text-amber-900">
            You have {unpaid.length} unpaid bill{unpaid.length === 1 ? "" : "s"} on this page, total{" "}
            <strong>{formatTaka(unpaid.reduce((sum, b) => sum + Number(b.amount), 0))}</strong>.
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 py-0">
        <SearchFilterBar showSearch={false} filters={[{ key: "status", label: "Paid and unpaid", options: toOptions(BILL_STATUS) }]} />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable columns={columns} rows={data?.data ?? []} getRowId={(b) => b.id} loading={isLoading} emptyTitle="No bills yet" emptyDescription="Your monthly bills will appear here." />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <ConfirmDialog
        open={!!paying}
        onOpenChange={(o) => !o && !pay.isPending && setPaying(null)}
        loading={pay.isPending}
        title={paying ? `Pay ${formatTaka(paying.amount)}?` : "Pay bill"}
        description={`You will be taken to the SSLCommerz test payment page for your ${paying ? formatBillMonth(paying.billMonth) : ""} bill. Sandbox card: 4111 1111 1111 1111, any future date, CVV 111.`}
        confirmLabel="Continue to payment"
        onConfirm={() => paying && pay.mutate(paying)}
      />
    </>
  );
}
