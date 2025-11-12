import * as Yup from 'yup';
import type { UserRole } from '../../utils/interfaces/userInterface';

export const getUserValidationSchema = (isEdit: boolean) =>
  Yup.object({
    email: Yup.string().trim().email('Invalid email').required('Email is required'),
    password: isEdit
      ? Yup.string().trim().notRequired()
      : Yup.string().trim().min(6, 'Min 6 chars').required('Password is required'),
    name: Yup.string().trim().nullable().required('Name is required'),
    designation: Yup.string().trim().nullable().required('Designation is required'),
    department: Yup.string().trim().nullable().required('Department is required'),
    profileImage: Yup.string().trim().url('Must be a valid URL').nullable(),
    status: Yup.mixed<0 | 1>().oneOf([0, 1]).required('Status is required'),
    role: Yup.mixed<UserRole>().oneOf([0, 1, 2, 3]).required('Role is required'),
    phoneNumber: Yup.string()
      .trim()
      .matches(/^[0-9\-+() ]*$/, 'Only digits and phone symbols allowed')
      .nullable().required('Phone number is required'),
    countryCode: Yup.string().trim().matches(/^\+?[0-9]{1,4}$/, 'Invalid country code').nullable().required('Country code is required'),
    dateOfBirth: Yup.string().trim().matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').nullable().required('Date of birth is required'),
  });


