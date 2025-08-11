import { z } from 'zod';

export const userFormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters long.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  contactNumber: z.string().min(10, {
    message: 'Please enter a valid contact number.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters long.',
  }),
  country: z.string().min(2, {
    message: 'Please select a country.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
  status: z.enum(['active', 'locked']).optional(),
});

export type CreateUserInput = z.infer<typeof userFormSchema>;

export const loginSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(1, {
        message: 'Password is required.',
    }),
});
