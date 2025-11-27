import { z } from 'zod';

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createResponseSchema } from './server.schema';

extendZodWithOpenApi(z);

export const ResponseSchemaDal = z.object({
    userId : z.string().uuid().openapi({ description: 'Unique identifier for the user', example: '123e4567-e89b-12d3-a456-426614174000' }),
    answerId : z.string().uuid().openapi({ description: 'Unique identifier for the answer', example: '550e8400-e29b-41d4-a716-446655440000' }),
    createdAt: z.date().openapi({ description: 'Timestamp when the response was created', example: '2023-10-01T12:00:00.000Z' }),
    updatedAt: z.date().openapi({ description: 'Timestamp when the response was last updated', example: '2023-10-02T12:00:00.000Z' }),
}).openapi('ResponseDal', { description: 'Data Access Layer schema for a response'});

export const RequestSchema = z.object({
    userId: z.string().uuid().openapi({
        description: 'Unique identifier for the user',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    answerId: z.array(z.string().uuid()).openapi({
        description: 'List of unique identifiers for the answers',
        example: ['550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440111']
    }),
}).openapi('RequestResponse', {
    description: 'Request schema for submitting responses'
});

export const ResponseSchema = z.object({
    score : z.number().min(0).max(10000).openapi({
        description: 'Score achieved by the user',
        example: 85
    }),
}).openapi('ResponseResponse', {
    description: 'Response schema containing the user score'
});

export type ResponseSchemaType = z.infer<typeof ResponseSchema>;
export type RequestSchemaType = z.infer<typeof RequestSchema>;
export type ResponseSchemaDalType = z.infer<typeof ResponseSchemaDal>;

export const ResponseResultServer = createResponseSchema(ResponseSchema);
