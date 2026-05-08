import type { CSSProperties, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  labelClassName?: string;
  valueClassName?: string;
  icon?: LucideIcon;
  trend?: string;
  trendClassName?: string;
  /** `metric`: label on top (reports). `hero`: icon row, value, label (dashboard). */
  variant?: "hero" | "metric";
};

/** KPI tile — dashboard / inventory / reports. */
export function StatCard({
  label,
  value,
  loading,
  className,
  style,
  labelClassName,
  valueClassName,
  icon: Icon,
  trend,
  trendClassName,
  variant = "hero",
}: StatCardProps) {
  if (variant === "metric") {
    return (
      <div className={cn("p-5 rounded-xl border", className)} style={style}>
        <div className={cn("text-sm text-muted-foreground", labelClassName)}>{label}</div>
        {loading ? (
          <Skeleton className="h-9 w-36 mt-1" />
        ) : (
          <div className={cn("font-display text-3xl font-bold mt-1", valueClassName)}>{value}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("p-5 rounded-xl border", className)} style={style}>
      {(Icon || trend) && (
        <div className="flex items-center justify-between mb-3">
          {Icon ? (
            <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground grid place-items-center">
              <Icon className="w-5 h-5" />
            </div>
          ) : (
            <span />
          )}
          {trend ? <span className={cn("text-xs font-medium", trendClassName)}>{trend}</span> : null}
        </div>
      )}
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : (
        <div className={cn("font-display font-bold", valueClassName ?? "text-3xl")}>{value}</div>
      )}
      <div className={cn("text-sm text-muted-foreground", Icon || trend ? "mt-1" : undefined, labelClassName)}>{label}</div>
    </div>
  );
}
