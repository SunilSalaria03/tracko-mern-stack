import * as Yup from "yup";

export const projectValidationSchema = Yup.object({
  name: Yup.string().trim().required("Project name is required"),
  description: Yup.string().max(500, "Description is too long"),
  startDate: Yup.date()
    .typeError("Start date is required")
    .required("Start date is required"),
  endDate: Yup.date()
    .typeError("End date is required")
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date cannot be before start date"),
  status: Yup.mixed<0 | 1 | 2 | 3>()
    .oneOf([0, 1, 2, 3], "Invalid status")
    .required("Status is required"),
});
