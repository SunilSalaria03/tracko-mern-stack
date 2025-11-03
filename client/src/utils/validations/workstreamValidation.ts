// src/utils/validations/workstreamValidation.ts
import * as Yup from "yup";
import type { WorkstreamFormData } from "../interfaces/workstreamInterface";

export const workstreamInitialValues: WorkstreamFormData = {
  name: "", 
  description: "",
 
};

export const getWorkstreamValidationSchema = () =>
  Yup.object({
    name: Yup.string().trim().required("Workstream name is required"),  
    description: Yup.string().trim().nullable(),
    
   
  });
