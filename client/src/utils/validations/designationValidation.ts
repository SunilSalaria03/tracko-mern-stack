import * as Yup from "yup";

export const designationValidationSchema = Yup.object({
  departmentId: Yup.string()
    .trim()
    .required("Department is required"),
  name: Yup.string()
    .trim()
    .required("Designation name is required")
    .max(100, "Name is too long"),
  description: Yup.string()
    .max(500, "Description is too long")
    .required("Description is required"),
});

// Handy initial values for forms
export const designationInitialValues = {
  departmentId: "",
  name: "",
  description: "",
};

