import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { AuthUser } from "@/types/models";
import { useSalesmenQuery } from "@/hooks/useUsers";
import { CreateSalesmanDialog } from "@/components/dialogs/create-salesman-dialog";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const salesmenQ = useSalesmenQuery({ refetchOnMount: "always" });
  const [localAdds, setLocalAdds] = useState<AuthUser[]>([]);
  const [open, setOpen] = useState(false);

  const users: AuthUser[] = [...localAdds, ...((salesmenQ.data ?? []) as AuthUser[])];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Team members with access.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-black/90 shadow-none">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesmenQ.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk-${i}`} className="card-soft p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full mt-3" />
              </div>
            ))
          : users.map((u, i) => (
              <div key={u.id} className="card-soft p-5 hover-lift animate-scale-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold text-lg">
                      {u.name?.[0] ?? "?"}
                    </div>
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setLocalAdds((prev) => prev.filter((x) => String(x.id) !== String(u.id)));
                      toast.success("Removed");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <span
                  className={`inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    u.role === "admin" ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
      </div>

      <CreateSalesmanDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(user) => {
          if (user) setLocalAdds((prev) => [user, ...prev]);
        }}
      />
    </div>
  );
}
