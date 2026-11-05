"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorViewProps {
  error: unknown;
  retry: () => void;
  homeHref: string;
  homeLabel: string;
}

// The "something went wrong" screen. Used by the root error.tsx and by each dashboard section,
// so an error inside a dashboard keeps the sidebar and header visible.
export function ErrorView({
  error,
  retry,
  homeHref,
  homeLabel,
}: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // The thrown value is not always an Error, so check before reading properties.
  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full text-center">
        <CardContent className="space-y-4">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-primary">
              Something went wrong
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              An unexpected error stopped this page from loading. You can try
              again, or go back to a safe page.
            </p>
            {digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error reference: {digest}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => retry()}>Try again</Button>
            <Link
              href={homeHref}
              className={buttonVariants({ variant: "outline" })}
            >
              {homeLabel}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
