"use client";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { PAYMENT_STATUS, toOptions } from "@/constants/labels";
import { useList } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { errorMessage } from "@/lib/api";
import { formatBillMonth, formatDateTime, formatTaka } from "@/lib/format";
import type { Payment } from "@/types/api";

export function MyPayments() {
  const { get, page } = useUrlFilters();
  // GET /payments/my-payments - every payment attempt of this customer
  const { data, isLoading, error } = useList<Payment>("payments/my-payments", { page, limit: 10, status: get("status") || undefined });

  const columns: Column<Payment>[] = [
    {
      header: "Transaction",
      cell: (p) => (
        <div>
          <p className="font-mono text-xs font-medium">{p.transactionId}</p>
          <p className="text-xs text-muted-foreground">{formatDateTime(p.createdAt)}</p>
        </div>
      ),
    },
    { header: "Bill", cell: (p) => formatBillMonth(p.bill.billMonth) },
    { header: "Amount", cell: (p) => <span className="font-medium">{formatTaka(p.amount)}</span> },
    { header: "Status", cell: (p) => <StatusBadge {...PAYMENT_STATUS[p.status]} /> },
    { header: "Method", cell: (p) => p.cardType ?? "-", className: "hidden md:table-cell" },
    { header: "Paid at", cell: (p) => (p.paidAt ? formatDateTime(p.paidAt) : "-"), className: "hidden lg:table-cell" },
  ];

  return (
    <>
      <PageHeader title="Payment History" description="Every payment attempt, including cancelled and failed ones." />
      <Card className="gap-0 py-0">
        <SearchFilterBar showSearch={false} filters={[{ key: "status", label: "All statuses", options: toOptions(PAYMENT_STATUS) }]} />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable columns={columns} rows={data?.data ?? []} getRowId={(p) => p.id} loading={isLoading} emptyTitle="No payments yet" emptyDescription="Pay a bill from My Bills." />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>
    </>
  );
}
