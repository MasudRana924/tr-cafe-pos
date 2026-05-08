import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
  /** Shown next to the spinner when `loading` is true; falls back to `children`. */
  loadingText?: React.ReactNode;
};

/**
 * Disables the control and shows a spinner while `loading` is true.
 * Use for any primary action that triggers an async API call.
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button ref={ref} disabled={disabled || loading} className={cn(className)} {...props}>
        {loading ? (
          <>
            <Loader2 className="animate-spin shrink-0" aria-hidden />
            <span>{loadingText !== undefined ? loadingText : children}</span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";
