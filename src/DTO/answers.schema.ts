import { z } from 'zod';

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const AnswerSchemaDal = z.object({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the answer', example: '550e8400-e29b-41d4-a716-446655440000' }),
  questionId: z.string().uuid().openapi({ description: 'Identifier of the associated question', example: '660e8400-e29b-41d4-a716-446655440000' }),
  answer: z.string().openapi({ description: 'Text of the answer', example: '42' }),
  isCorrect: z.boolean().default(false).openapi({ description: 'Indicates if the answer is correct', example: false }),
  createdAt: z.date().openapi({ description: 'Timestamp when the answer was created', example: '2023-10-01T12:00:00.000Z' }),
  updatedAt: z.date().openapi({ description: 'Timestamp when the answer was last updated', example: '2023-10-02T12:00:00.000Z' }),
}).openapi('AnswerDal', { description: 'Data Access Layer schema for an answer'});

export const AnswerSchema = AnswerSchemaDal.omit({
    createdAt: true,
    updatedAt: true,
}).openapi('Answer', { description: 'API schema for an answer'});

export const AnswerSchemaSecret = AnswerSchema.omit({
    isCorrect: true,
}).openapi('AnswerSecret', { description: 'API schema for an answer without the correctness information'});

export const CreateAnswerSchema = AnswerSchema.omit({
  id: true,
  questionId: true,
}).openapi('CreateAnswer', { description: 'Schema for creating a new answer' });

export type AnswerSchemaType = z.infer<typeof AnswerSchema>;
export type AnswerSchemaSecretType = z.infer<typeof AnswerSchemaSecret>;
export type CreateAnswerSchemaType = z.infer<typeof CreateAnswerSchema>;
export type AnswerSchemaDalType = z.infer<typeof AnswerSchemaDal>;