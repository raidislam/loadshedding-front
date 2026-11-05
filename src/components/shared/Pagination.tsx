"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlFilters } from "@/hooks/useUrlFilters";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
}

// Previous / Next buttons. The page number is stored in the URL (?page=2).
export function Pagination({ page, totalPages, totalItems }: PaginationProps) {
  const { setParams } = useUrlFilters();

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        Page {page} of {totalPages} · {totalItems} result{totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setParams({ page: String(page - 1) })}
        >
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setParams({ page: String(page + 1) })}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
