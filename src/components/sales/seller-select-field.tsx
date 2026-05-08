import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuthUser } from "@/types/models";

type Props = {
  salesmen: AuthUser[];
  loading: boolean;
  /** Current seller id from URL or "" for none */
  valueId: string;
  showOrphanOption: boolean;
  orphanLabel?: string;
  onChange: (sellerId: string | undefined) => void;
};

/** Admin-only salesman dropdown (same roster as Users). */
export function SellerSelectField({ salesmen, loading, valueId, showOrphanOption, orphanLabel, onChange }: Props) {
  const selectValue = valueId ? String(valueId) : "__none__";

  return (
    <div className="w-full sm:max-w-xs">
      <Label className="text-xs mb-1.5 block">Salesman (from Users)</Label>
      {loading ? (
        <Skeleton className="h-11 w-full rounded-md" />
      ) : (
        <Select
          value={selectValue}
          onValueChange={(v) => onChange(v === "__none__" ? undefined : v)}
        >
          <SelectTrigger
            className="h-11 w-full shadow-none bg-background"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" }}
          >
            <SelectValue placeholder="Choose a salesman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— Choose salesman —</SelectItem>
            {showOrphanOption && valueId && (
              <SelectItem value={String(valueId)}>{orphanLabel ?? `Seller #${valueId} (not in current list)`}</SelectItem>
            )}
            {salesmen.filter((u) => !showOrphanOption || String(u.id) !== String(valueId)).map((u) => (
              <SelectItem key={String(u.id)} value={String(u.id)}>
                {`${u.name} (#${u.id})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
