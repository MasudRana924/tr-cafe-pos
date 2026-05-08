import * as yup from "yup";
import type { Role } from "@/types/enums";

export const createSalesmanSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
  role: yup.mixed<Role>().oneOf(["admin", "salesman"]).required(),
});

export type CreateSalesmanFormValues = yup.InferType<typeof createSalesmanSchema>;
