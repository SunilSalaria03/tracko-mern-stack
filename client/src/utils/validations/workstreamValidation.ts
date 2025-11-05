// src/utils/validations/workstreamValidation.ts
import * as Yup from "yup";
 
 


  export const workstreamValidationSchema = Yup.object({
    name: Yup.string().trim().required("Workstream name is required").max(100, "Name is too long"),
    description: Yup.string().max(500, "Description is too long").required("Description is required"),
    status: Yup.mixed<0 | 1>().oneOf([0, 1], "Invalid status").required("Status is required"),
  });