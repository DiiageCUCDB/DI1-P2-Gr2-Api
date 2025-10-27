import { z } from 'zod';
import { createResponseSchema } from './server.schema';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

export const userCore = z.object ({
  email: z.string().email().openapi({
    description: 'The user\'s email address',
    example: 'example@gmail.com',
  }),
  name: z.string().openapi({
    description: 'The user\'s full name',
    example: 'John Doe',
  }),
});

export const CreateUserSchema = userCore.extend({
  password: z.string().min(8, 'Password must be at least 8 characters long').openapi({
    description: 'The user\'s password',
    example: 'password123',
  }),
}).openapi({description: 'Schema for creating a new user'});

export const LoginSchema = z.object({
  email: z.string().email().openapi({
    description: 'The user\'s email address for login',
    example: 'example@gmail.com',
  }),
  password: z.string().openapi({
    description: 'The user\'s password for login',
    example: 'password123',
  }),
}).openapi({description: 'Schema for user login'});

export const CreateUserResponseSchema = userCore.extend({
  id: z.number().openapi({
    description: 'The unique identifier for the user',
    example: 1,
  }),
}).openapi({description: 'Response schema for creating a new user'});

export const LoginResponseSchema = z.object({
  accessToken: z.string().openapi({
    description: 'JWT access token for authenticated user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  }),
}).openapi({description: 'Response schema for user login'});

// ✅ Export inferred TypeScript types
export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type CreateUserResponseSchemaType = z.infer<typeof CreateUserResponseSchema>;
export type LoginResponseSchemaType = z.infer<typeof LoginResponseSchema>;

export const ResponseWithLoginResponseSchema = createResponseSchema(LoginResponseSchema);
export const ResponseWithCreateUserResponseSchema = createResponseSchema(CreateUserResponseSchema);