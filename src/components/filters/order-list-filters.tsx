import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inputStyle = {
  width: "510px",
  height: "50px",
  borderRadius: "16px",
  backgroundColor: "#F5F5F5",
  border: "1px solid #F5F5F5",
  boxShadow: "none",
} as const;

const selectTriggerStyle = { backgroundColor: "#F5F5F5", border: "1px solid #F5F5F5", boxShadow: "none" } as const;

type Props = {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (v: string) => void;
};

/** Search + payment filter row for paged order lists (admin orders). */
export function OrderListFilters({ searchQuery, onSearchQueryChange, paymentFilter, onPaymentFilterChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search by order ID..."
          className="pl-9"
          style={inputStyle}
        />
      </div>
      <Select value={paymentFilter} onValueChange={onPaymentFilterChange}>
        <SelectTrigger className="sm:w-56 h-[50px] rounded-lg" style={selectTriggerStyle}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          <SelectItem value="Cash">Cash</SelectItem>
          <SelectItem value="bKash">bKash</SelectItem>
          <SelectItem value="Nagad">Nagad</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
