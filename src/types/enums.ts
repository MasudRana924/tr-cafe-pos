export type Role = "admin" | "salesman";

// What the backend expects in /api/orders
export type PaymentMethodApi = "cash" | "bkash" | "nagad";

// What the UI shows today (keep existing flow/text)
export type PaymentMethodUi = "Cash" | "bKash" | "Nagad";

export const PaymentMethod = {
  toApi(method: PaymentMethodUi): PaymentMethodApi {
    switch (method) {
      case "Cash":
        return "cash";
      case "bKash":
        return "bkash";
      case "Nagad":
        return "nagad";
    }
  },
  fromApi(method: string): PaymentMethodUi {
    const m = method.toLowerCase();
    if (m === "bkash") return "bKash";
    if (m === "nagad") return "Nagad";
    return "Cash";
  },
} as const;

