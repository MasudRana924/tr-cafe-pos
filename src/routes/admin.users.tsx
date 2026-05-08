import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Role } from "@/types/enums";
import type { AuthUser } from "@/types/models";
import { useCreateSalesmanMutation, useSalesmenQuery } from "@/hooks/useUsers";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
  role: yup.mixed<Role>().oneOf(["admin", "salesman"]).required(),
});

function UsersPage() {
  const salesmenQ = useSalesmenQuery({ refetchOnMount: "always" });
  const [localAdds, setLocalAdds] = useState<AuthUser[]>([]);
  const [open, setOpen] = useState(false);
  const createSalesman = useCreateSalesmanMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ name: string; email: string; password: string; role: Role }>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "salesman" },
  });

  const submit = async (values: { name: string; email: string; password: string; role: Role }) => {
    try {
      const res = await createSalesman.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      const user = (res as any)?.data?.user ?? (res as any)?.user ?? (res as any)?.data ?? res;
      if (user) setLocalAdds((prev) => [{ ...(user as AuthUser), role: "salesman" }, ...prev]);
      const msg = (res as any)?.responseMessage ?? "Salesman account created";
      toast.success(msg);
      reset();
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Create user failed");
    }
  };

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
                <span className={`inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-accent text-accent-foreground"}`}>
                  {u.role}
                </span>
              </div>
            ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div>
              <Label className="mb-2 block">Name</Label>
              <Input {...register("name")} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" />
              {errors.name?.message && <div className="text-xs text-destructive mt-1">{errors.name.message}</div>}
            </div>
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input type="email" {...register("email")} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" />
              {errors.email?.message && <div className="text-xs text-destructive mt-1">{errors.email.message}</div>}
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input type="password" {...register("password")} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" />
              {errors.password?.message && <div className="text-xs text-destructive mt-1">{errors.password.message}</div>}
            </div>
            <div>
              <Label className="mb-2 block">Role</Label>
              <Select value={watch("role")} onValueChange={(v) => setValue("role", v as Role)}>
                <SelectTrigger className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesman">Salesman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="shadow-none">Cancel</Button>
            <Button type="submit" className="bg-black text-white hover:bg-black/90 shadow-none" disabled={createSalesman.isPending}>
              {createSalesman.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
