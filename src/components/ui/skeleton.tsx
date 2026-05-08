import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md", className)} style={{ backgroundColor: '#F6F6F6' }} {...props} />;
}

export { Skeleton };
