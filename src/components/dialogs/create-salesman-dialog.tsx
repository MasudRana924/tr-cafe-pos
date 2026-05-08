import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AuthUser } from "@/types/models";
import { CreateSalesmanForm } from "@/components/forms/create-salesman-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (user: AuthUser | null) => void;
};

export function CreateSalesmanDialog({ open, onOpenChange, onCreated }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <CreateSalesmanForm
          onSuccess={(user) => {
            onCreated(user);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
