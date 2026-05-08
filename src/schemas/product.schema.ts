import * as yup from "yup";

export const productSchema = yup.object({
  name: yup.string().required("Name is required"),
  price: yup.number().typeError("Price must be a number").min(0, "Price must be >= 0").required("Price is required"),
  quantity: yup.number().typeError("Quantity must be a number").min(0, "Quantity must be >= 0").default(0),
  category: yup.string().required("Category is required"),
  image_url: yup.string().nullable().default(null),
  image: yup.mixed().nullable().default(null),
  barcode: yup.string().nullable().default(null),
});

export type ProductFormValues = yup.InferType<typeof productSchema>;
