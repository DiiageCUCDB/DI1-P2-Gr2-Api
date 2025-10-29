import { z } from 'zod';

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ResponseSchemaDal = z.object({
    userId : z.string().uuid().openapi({ description: 'Unique identifier for the user', example: '123e4567-e89b-12d3-a456-426614174000' }),
    answerId : z.string().uuid().openapi({ description: 'Unique identifier for the answer', example: '550e8400-e29b-41d4-a716-446655440000' }),
    createdAt: z.date().openapi({ description: 'Timestamp when the response was created', example: '2023-10-01T12:00:00.000Z' }),
    updatedAt: z.date().openapi({ description: 'Timestamp when the response was last updated', example: '2023-10-02T12:00:00.000Z' }),
}).openapi('ResponseDal', { description: 'Data Access Layer schema for a response'});

export const ResponseSchema = ResponseSchemaDal.omit({
    createdAt: true,
    updatedAt: true,
}).openapi('Response', { description: 'API schema for a response'});

export type ResponseSchemaType = z.infer<typeof ResponseSchema>;
export type ResponseSchemaDalType = z.infer<typeof ResponseSchemaDal>;