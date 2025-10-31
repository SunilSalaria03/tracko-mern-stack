import * as Yup from "yup";

export const projectValidationSchema = Yup.object({
  name: Yup.string().trim().required("Project name is required"),
//   code: Yup.string()
//     .trim()
//     .required("Project code is required")
//     .matches(
//       /^[A-Z0-9-]+$/i,
//       "Project code should only contain letters, numbers, and hyphens"
//     ),
  description: Yup.string(),
 
   
});
