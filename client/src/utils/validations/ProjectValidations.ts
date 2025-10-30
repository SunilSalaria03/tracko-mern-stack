import * as Yup from "yup";

export const projectValidationSchema = Yup.object({
  name: Yup.string().trim().required("Project name is required"),
  code: Yup.string()
    .trim()
    .required("Project code is required")
    .matches(
      /^[A-Z0-9-]+$/i,
      "Project code should only contain letters, numbers, and hyphens"
    ),
  description: Yup.string(),

  status: Yup.string()
    .oneOf(["active", "completed", "on-hold", "cancelled"])
    .required(),
  clientName: Yup.string(),
  budget: Yup.number()
    .min(0, "Budget cannot be negative")
    .typeError("Budget must be a number"),
});
