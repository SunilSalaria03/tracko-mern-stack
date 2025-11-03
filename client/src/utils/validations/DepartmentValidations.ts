import * as Yup from "yup";

export const departmentValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Department name is required")
    .max(100, "Department name is too long"),
  description: Yup.string()
    .max(500, "Description is too long")
      .required("Description is required"),
  status: Yup.mixed<0 | 1>()
    .oneOf([0, 1], "Invalid status")
    .required("Status is required"),
});
