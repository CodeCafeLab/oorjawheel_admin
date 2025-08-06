import { z } from 'zod';

export const userFormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  status: z.enum(['active', 'locked'], {
    required_error: 'Please select a status.',
  }),
  // A password field can be added here when creating the form
  // For now, we'll omit it as the backend will handle hashing.
});
