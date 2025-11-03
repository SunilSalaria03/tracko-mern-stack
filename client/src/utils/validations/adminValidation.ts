// src/utils/validations/adminValidation.ts
import * as Yup from "yup";
import type { AdminFormData } from "../interfaces/adminInterface";

export const adminInitialValues: AdminFormData = {
  role: 1,
  email: "",
  name: "",
  phoneNumber: "",
  countryCode: "+91",
  designation: "",
  department: "",
  status: 1,
  password: "",
  dateOfBirth: "",
};

export const getAdminValidationSchema = (isEdit: boolean) =>
  Yup.object({
    role: Yup.mixed<0 | 1 | 2>().oneOf([0, 1, 2], "Invalid role").required(),
    email: Yup.string().trim().email("Invalid email").required("Email is required"),
    name: Yup.string().trim().required("Name is required").max(120, "Too long"),
    phoneNumber: Yup.string()
      .trim()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    countryCode: Yup.string().trim().required("Country code is required"),
    designation: Yup.string().trim().required("Designation is required"),
    department: Yup.string().trim().required("Department is required"),
    status: Yup.mixed<0 | 1>().oneOf([0, 1], "Invalid status").required(),
    password: isEdit
      ? Yup.string().optional()
      : Yup.string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
    dateOfBirth: Yup.string().optional(),
  });
