import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, useStore, type Role } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const users = useStore((s) => s.users);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("salesman");

  const submit = () => {
    if (!name || !email) return toast.error("All fields required");
    store.addUser({ name, email, role });
    setName(""); setEmail(""); setRole("salesman");
    setOpen(false);
    toast.success("User added");
  };

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
        {users.map((u, i) => (
          <div key={u.id} className="card-soft p-5 hover-lift animate-scale-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold text-lg">
                  {u.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { store.deleteUser(u.id); toast.success("Removed"); }}>
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
          <div className="space-y-4">
            <div><Label className="mb-2 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" /></div>
            <div><Label className="mb-2 block">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none" /></div>
            <div>
              <Label className="mb-2 block">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-full h-[58px] px-4 rounded-[12px] border border-[#E5E7EB] bg-white focus:outline-none focus:border-[#E5E7EB] shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="salesman">Salesman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="shadow-none">Cancel</Button>
            <Button onClick={submit} className="bg-black text-white hover:bg-black/90 shadow-none">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
