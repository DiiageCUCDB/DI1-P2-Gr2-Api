import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createResponseSchema
    
 } from './server.schema';
extendZodWithOpenApi(z);

export const UserSchemaDal = z.object({
  id: z.string().uuid().openapi({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000'
  }),

  username: z.string().openapi({
    description: 'Unique username of the user',
    example: 'john_doe'
  }),

  score: z.number().int().default(0).openapi({
    description: 'User score',
    example: 12
  }),

  guildId: z.string().uuid().openapi({
    description: 'Identifier of the guild this user belongs to',
    example: '770e8400-e29b-41d4-a716-446655440000'
  }),

  createdAt: z.date().openapi({
    description: 'Timestamp when the user was created',
    example: '2024-10-01T12:00:00.000Z'
  }),

  updatedAt: z.date().openapi({
    description: 'Timestamp when the user was last updated',
    example: '2024-10-02T12:00:00.000Z'
  }),
}).openapi('UserDal', { description: 'Data Access Layer schema for a user' });


// --- Public API Schema (sans dates)
export const UserSchema = UserSchemaDal.omit({
  createdAt: true,
  updatedAt: true,
}).openapi('User', { description: 'API schema for a user' });


// --- Schema API sans champs sensibles (si besoin)
export const UserSchemaPublic = UserSchema.omit({
}).openapi('UserPublic', {
  description: 'Public user schema without sensitive information'
});


// --- Schema pour création
export const CreateUserSchema = UserSchema.omit({
  id: true,
  score: true,
  guildId: true
}).openapi('CreateUser', {
  description: 'Schema for creating a new user'
});


// --- Types
export type UserSchemaDalType = z.infer<typeof UserSchemaDal>;
export type UserSchemaType = z.infer<typeof UserSchema>;
export type UserSchemaPublicType = z.infer<typeof UserSchemaPublic>;
export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;

export const LoginResult = createResponseSchema(UserSchemaPublic);