import { z } from 'zod';

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ChallengeSchemaDal = z.object({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the challenge', example: '123e4567-e89b-12d3-a456-426614174000' }),
  name: z.string().openapi({ description: 'Name of the challenge', example: 'Ultimate Coding Challenge' }),
  description: z.string().openapi({ description: 'Detailed description of the challenge', example: 'Solve complex coding problems to win prizes.' }),
  difficulty: z.number().openapi({ description: 'Difficulty level of the challenge', example: 5 }),
  isGuildChallenge: z.boolean().default(false).openapi({ description: 'Indicates if the challenge is for guilds', example: false }),
  createdAt: z.date().openapi({ description: 'Timestamp when the challenge was created', example: '2023-10-01T12:00:00.000Z' }),
  updatedAt: z.date().openapi({ description: 'Timestamp when the challenge was last updated', example: '2023-10-02T12:00:00.000Z' }),
}).openapi('ChallengeDal', { description: 'Data Access Layer schema for a challenge'});

export const ChallengeSchema = ChallengeSchemaDal.omit({
  createdAt: true,
  updatedAt: true,
}).openapi('Challenge', { description: 'API schema for a challenge'});

export const CreateChallengeSchema = ChallengeSchema.omit({
  id: true,
}).openapi('CreateChallenge', { description: 'Schema for creating a new challenge'});

export const UpdateChallengeSchema = CreateChallengeSchema.partial().openapi('UpdateChallenge', { description: 'Schema for updating an existing challenge'});

export const GetChallengesResponseSchema = z.object({
  challenges: z.array(ChallengeSchema).openapi({ description: 'List of challenges' }),
  totalChallenges: z.number().openapi({ description: 'Total number of challenges available' }),
  totalPages: z.number().openapi({ description: 'Total number of pages' }),
  currentPage: z.number().openapi({ description: 'Current page number' }),
}).openapi('GetChallengesResponse', { description: 'Response schema for getting a list of challenges' });

// Add missing validation for challenge ID
export const ChallengeIdSchema = z.object({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the challenge', example: '123e4567-e89b-12d3-a456-426614174000' }),
}).openapi('ChallengeId', { description: 'Schema for challenge ID validation' });

// Export types
export type CreateChallengeSchemaType = z.infer<typeof CreateChallengeSchema>;
export type UpdateChallengeSchemaType = z.infer<typeof UpdateChallengeSchema>;
export type ChallengeSchemaDalType = z.infer<typeof ChallengeSchemaDal>;
export type ChallengeSchemaType = z.infer<typeof ChallengeSchema>;