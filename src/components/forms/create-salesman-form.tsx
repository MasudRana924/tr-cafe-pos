import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/buttons/loading-button";
import type { Role } from "@/types/enums";
import type { AuthUser } from "@/types/models";
import { createSalesmanSchema, type CreateSalesmanFormValues } from "@/schemas/users.schema";
import { useCreateSalesmanMutation } from "@/hooks/useUsers";

const inputClass =
  "w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none";
const inputStyle = { backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" } as const;

type Props = {
  onSuccess: (user: AuthUser | null) => void;
  onCancel: () => void;
};

export function CreateSalesmanForm({ onSuccess, onCancel }: Props) {
  const createSalesman = useCreateSalesmanMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSalesmanFormValues>({
    resolver: yupResolver(createSalesmanSchema),
    defaultValues: { name: "", email: "", password: "", role: "salesman" },
  });

  const submit = async (values: CreateSalesmanFormValues) => {
    try {
      const res = await createSalesman.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      const userRaw = (res as any)?.data?.user ?? (res as any)?.user ?? (res as any)?.data ?? res;
      const user = userRaw ? ({ ...(userRaw as AuthUser), role: "salesman" as const } as AuthUser) : null;
      const msg = (res as any)?.responseMessage ?? "Salesman account created";
      toast.success(msg);
      reset();
      onSuccess(user);
    } catch (e: any) {
      toast.error(e?.message ?? "Create user failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Name</Label>
          <Input {...register("name")} className={inputClass} style={inputStyle} />
          {errors.name?.message && <div className="text-xs text-destructive mt-1">{errors.name.message}</div>}
        </div>
        <div>
          <Label className="mb-2 block">Email</Label>
          <Input type="email" {...register("email")} className={inputClass} style={inputStyle} />
          {errors.email?.message && <div className="text-xs text-destructive mt-1">{errors.email.message}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Password</Label>
          <Input type="password" {...register("password")} className={inputClass} style={inputStyle} />
          {errors.password?.message && <div className="text-xs text-destructive mt-1">{errors.password.message}</div>}
        </div>
        <div>
          <Label className="mb-2 block">Role</Label>
          <Select value={watch("role")} onValueChange={(v) => setValue("role", v as Role)}>
            <SelectTrigger className={`${inputClass}`} style={inputStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salesman">Salesman</SelectItem>
            </SelectContent>
          </Select>
          {errors.role?.message && <div className="text-xs text-destructive mt-1">{errors.role.message}</div>}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="shadow-none" style={{ width: "150px" }}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          className="bg-black text-white hover:bg-black/90 shadow-none"
          style={{ width: "150px" }}
          loading={createSalesman.isPending}
          loadingText="Creating..."
        >
          Create
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}
