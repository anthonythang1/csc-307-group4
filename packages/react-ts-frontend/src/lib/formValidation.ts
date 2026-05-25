import { z } from 'zod';

const currentYear = new Date().getFullYear();
const phoneCharacters = /^[0-9()+.\-\s]*$/;

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const nonNegativeWholeNumber = (label: string) =>
  z.coerce
    .number({
      error: `${label} must be a non-negative whole number.`,
    })
    .int(`${label} must be a non-negative whole number.`)
    .min(0, `${label} must be a non-negative whole number.`);

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === '' || z.email().safeParse(value).success, {
    message: 'Enter a valid owner email.',
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => phoneCharacters.test(value), {
    message: 'Enter a valid phone number.',
  })
  .refine(
    (value) => value === '' || value.replace(/\D/g, '').length >= 7,
    { message: 'Enter a valid phone number.' }
  );

export const propertyRegistrationSchema = z.object({
  propAddress: requiredText('Address'),
  propCity: requiredText('City'),
  propZipcode: requiredText('Zipcode').regex(
    /^\d{5}(-\d{4})?$/,
    'Enter a valid zipcode.'
  ),
  propNumBeds: nonNegativeWholeNumber('Beds'),
  propNumBaths: nonNegativeWholeNumber('Baths'),
  propSqft: nonNegativeWholeNumber('Sqft'),
  propYearBuilt: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}$/.test(value), {
      message: 'Enter a valid year built.',
    })
    .refine(
      (value) =>
        value === '' ||
        (Number(value) >= 1800 && Number(value) <= currentYear),
      { message: 'Enter a valid year built.' }
    ),
  propZoning: z.string().trim(),
  propOwnerEmail: optionalEmail,
  propOwnerPhone: optionalPhone,
});

export const loginSchema = z.object({
  email: requiredText('Email').email('Enter a valid email.'),
  password: requiredText('Password'),
});

export const signUpSchema = z
  .object({
    firstName: requiredText('First name'),
    lastName: requiredText('Last name'),
    email: requiredText('Email').email('Enter a valid email.'),
    password: requiredText('Password').min(
      8,
      'Password must be at least 8 characters.'
    ),
    confirmPassword: requiredText('Confirm password'),
    agreeToTerms: z.boolean().refine((value) => value, {
      message: 'Please agree to the terms and conditions.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export function zodErrorMap<T extends object>(
  error: z.ZodError<T>
) {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function firstZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form and try again.';
}
