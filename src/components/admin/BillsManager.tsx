"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchFilterBar } from "@/components/shared/SearchFilterBar";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BILL_STATUS, toOptions } from "@/constants/labels";
import { useList, useOptions } from "@/hooks/useApi";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { api, errorMessage } from "@/lib/api";
import { formatBillMonth, formatDate, formatTaka } from "@/lib/format";
import { billSchema, type BillValues } from "@/lib/validations";
import type { Bill, User } from "@/types/api";

export function BillsManager() {
  const { get, page } = useUrlFilters();
  const [createOpen, setCreateOpen] = useState(false);

  // GET /bills (admin): filters + search by customer name, email or meter number
  const { data, isLoading, error } = useList<Bill>("bills", {
    page,
    limit: 10,
    status: get("status") || undefined,
    billMonth: get("month") || undefined,
    searchTerm: get("q") || undefined,
  });

  const columns: Column<Bill>[] = [
    {
      header: "Customer",
      cell: (b) => (
        <div>
          <p className="font-medium">{b.customer?.name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{b.customer?.meterNumber ?? b.customer?.email}</p>
        </div>
      ),
    },
    { header: "Month", cell: (b) => formatBillMonth(b.billMonth) },
    { header: "Units", cell: (b) => `${b.unitsConsumed} kWh`, className: "hidden md:table-cell" },
    { header: "Amount", cell: (b) => <span className="font-medium">{formatTaka(b.amount)}</span> },
    { header: "Due", cell: (b) => formatDate(b.dueDate), className: "hidden lg:table-cell" },
    { header: "Status", cell: (b) => <StatusBadge {...BILL_STATUS[b.status]} /> },
    { header: "Paid on", cell: (b) => (b.paidAt ? formatDate(b.paidAt) : "-"), className: "hidden lg:table-cell" },
  ];

  return (
    <>
      <PageHeader
        title="Electricity Bills"
        description="Monthly bills. Customers pay them online through SSLCommerz."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Create bill
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <SearchFilterBar
          searchPlaceholder="Search customer name, email or meter"
          filters={[{ key: "status", label: "Paid and unpaid", options: toOptions(BILL_STATUS) }]}
        />
        {error ? (
          <p className="p-6 text-destructive">{errorMessage(error)}</p>
        ) : (
          <DataTable columns={columns} rows={data?.data ?? []} getRowId={(b) => b.id} loading={isLoading} emptyTitle="No bills found" emptyDescription="Create a bill for a customer." />
        )}
        <Pagination page={data?.meta?.page ?? 1} totalPages={data?.meta?.totalPages ?? 1} totalItems={data?.meta?.total ?? 0} />
      </Card>

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Create electricity bill" description="The customer gets a notification and can pay online.">
        <CreateBillForm onDone={() => setCreateOpen(false)} />
      </FormDialog>
    </>
  );
}

function CreateBillForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const { data: customers = [] } = useOptions<User>("admin/users", { role: "CUSTOMER", sortBy: "name", sortOrder: "asc" });

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: { customerId: "", billMonth: new Date().toISOString().slice(0, 7), unitsConsumed: "", amount: "", dueDate: "" },
  });

  const create = useMutation({
    mutationFn: (v: BillValues) =>
      api("/bills", {
        method: "POST",
        body: { customerId: v.customerId, billMonth: v.billMonth, unitsConsumed: Number(v.unitsConsumed), amount: Number(v.amount), dueDate: v.dueDate },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Bill created. The customer was notified.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)), // e.g. 409: a bill for that month already exists
  });

  return (
    <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4" noValidate>
      <FormField label="Customer" htmlFor="b-customer" error={errors.customerId?.message}>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="b-customer"
              value={field.value}
              onChange={field.onChange}
              placeholder="Choose a customer"
              invalid={!!errors.customerId}
              options={customers.map((c) => ({ value: c.id, label: `${c.name}${c.meterNumber ? ` · ${c.meterNumber}` : ""}` }))}
            />
          )}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Bill month" htmlFor="b-month" error={errors.billMonth?.message} hint="One bill per customer per month.">
          <Input id="b-month" type="month" aria-invalid={!!errors.billMonth} {...register("billMonth")} />
        </FormField>
        <FormField label="Due date" htmlFor="b-due" error={errors.dueDate?.message}>
          <Input id="b-due" type="date" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
        </FormField>
        <FormField label="Units used (kWh)" htmlFor="b-units" error={errors.unitsConsumed?.message}>
          <Input id="b-units" inputMode="numeric" aria-invalid={!!errors.unitsConsumed} {...register("unitsConsumed")} />
        </FormField>
        <FormField label="Amount (৳)" htmlFor="b-amount" error={errors.amount?.message}>
          <Input id="b-amount" inputMode="decimal" placeholder="725.50" aria-invalid={!!errors.amount} {...register("amount")} />
        </FormField>
      </div>
      <Button type="submit" className="h-9 w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create bill"}
      </Button>
    </form>
  );
}
