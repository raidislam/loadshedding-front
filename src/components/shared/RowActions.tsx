import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface RowActionsProps {
  viewHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  label: string; // used in the accessible names, e.g. "Mirpur"
}

export function RowActions({ viewHref, onEdit, onDelete, label }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {viewHref && (
        <Link href={viewHref} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label={`View ${label}`} title="View">
          <Eye />
        </Link>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${label}`} title="Edit">
          <Pencil />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${label}`} title="Delete" className="text-destructive hover:text-destructive">
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
