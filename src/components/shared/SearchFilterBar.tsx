"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlFilters } from "@/hooks/useUrlFilters";

export interface FilterConfig {
  key: string; // query parameter name, e.g. "status"
  label: string; // shown for the "all" option, e.g. "All statuses"
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: FilterConfig[];
  dateFilter?: { key: string; label: string }; // optional date picker
}

// Search box + dropdown filters. Everything is saved in the URL query string.
export function SearchFilterBar({
  searchPlaceholder = "Search...",
  showSearch = true,
  filters = [],
  dateFilter,
}: SearchFilterBarProps) {
  const { get, setParams, clearAll, hasFilters } = useUrlFilters();

  return (
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:flex-wrap sm:items-center">
      {showSearch && (
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={get("q")}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="pl-8"
            onChange={(e) => setParams({ q: e.target.value })}
          />
        </div>
      )}

      {filters.map((filter) => {
        const items = [
          { value: "ALL", label: filter.label },
          ...filter.options,
        ];
        return (
          <Select
            key={filter.key}
            items={items}
            value={get(filter.key, "ALL")}
            onValueChange={(value) => setParams({ [filter.key]: value ?? "" })}
          >
            <SelectTrigger className="sm:w-48" aria-label={filter.label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {dateFilter && (
        <Input
          type="date"
          aria-label={dateFilter.label}
          title={dateFilter.label}
          className="sm:w-44"
          value={get(dateFilter.key)}
          onChange={(e) => setParams({ [dateFilter.key]: e.target.value })}
        />
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X /> Clear
        </Button>
      )}
    </div>
  );
}
