import { z } from 'zod';
import { AnswerSchemaDal, AnswerSchemaSecret, CreateAnswerSchema } from './answers.schema';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createResponseSchema } from './server.schema';

extendZodWithOpenApi(z);

export const QuestionSchemaDal = z.object({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the question', example: '770e8400-e29b-41d4-a716-446655440000' }),
  challengeId: z.string().uuid().openapi({ description: 'Identifier of the associated challenge', example: '880e8400-e29b-41d4-a716-446655440000' }),
  questionText: z.string().openapi({ description: 'Text of the question', example: 'What is the answer to life, the universe and everything?' }),
  answers: z.array(AnswerSchemaDal).min(1).openapi({ description: 'List of possible answers for the question' }),
  points: z.number().default(0).openapi({ description: 'Points awarded for the question', example: 10 }),
  createdAt: z.date().openapi({ description: 'Timestamp when the question was created', example: '2023-10-01T12:00:00.000Z' }),
  updatedAt: z.date().openapi({ description: 'Timestamp when the question was last updated', example: '2023-10-02T12:00:00.000Z' }),
}).openapi('QuestionDal', { description: 'Data Access Layer schema for a question'});

export const QuestionSchema = QuestionSchemaDal.omit({
  createdAt: true,
  updatedAt: true
}).extend({
  answers: z.array(AnswerSchemaSecret).min(1).openapi({ description: 'List of possible answers for the question' }),
}).openapi('Question', { description: 'API schema for a question'});

// Create Question Schema (includes answers)
export const CreateQuestionSchema = QuestionSchema.omit({
  id: true,
}).extend({
  answers: z.array(CreateAnswerSchema).min(1).openapi({ description: 'List of possible answers for the question' }),
}).openapi('CreateQuestion', { description: 'Schema for creating a new question with answers' });

// Update Question Schema
export const UpdateQuestionSchema = CreateQuestionSchema.omit({ points: true }).partial().openapi('UpdateQuestion', { description: 'Schema for updating an existing question' });

// Question ID Schema
export const QuestionIdSchema = z.object({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the question', example: '770e8400-e29b-41d4-a716-446655440000' }),
}).openapi('QuestionId', { description: 'Schema for question ID validation' });

export type QuestionSchemaType = z.infer<typeof QuestionSchema>;
export type QuestionSchemaDalType = z.infer<typeof QuestionSchemaDal>;
export type CreateQuestionSchemaType = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionSchemaType = z.infer<typeof UpdateQuestionSchema>;

export const QuestionResultServer = createResponseSchema(QuestionSchema);