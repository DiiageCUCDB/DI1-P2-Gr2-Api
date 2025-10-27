// Importing the Zod library for schema validation
import { z } from 'zod';

// Importing a function to extend Zod with OpenAPI capabilities
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extending Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

// Function to create a generic response schema dynamically
export const createResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.object({
      // Result is a nullable field of the provided schema type
      result: schema.nullable(),
      // Results is an array of the provided schema type, nullable
      results: z.array(schema).nullable(),
      // Duration of the response generation, optional field
      generationTime_ms: z.number().optional().openapi({ description: 'Duration of the response generation', example: 123.456 }),
      // Success status, optional field
      success: z.boolean().optional().openapi({ description: 'Success status', example: true }),
      // Message, nullable and optional field
      message: z.string().nullable().optional().openapi({ description: 'Message', example: 'Success' })
    }).openapi('Response', { description: 'Generic API response' });

// Defining a schema for ResponseError using Zod
export const ResponseError = z.object({
    // Duration of the response generation
    generationTime_ms: z.string().openapi({ description: 'Duration of the response generation', example: '123456ms' }),
    // Success status
    success: z.boolean().openapi({ description: 'Success status', example: false }),
    // Message, nullable field
    message: z.string().nullable().openapi({ description: 'Message', example: 'Error' }),
    // Error details
    error: z.any().openapi({ description: 'Error details' }),
}).openapi('ResponseError', { description: 'Error details' });


// Defining a schema for HealthCheck using Zod
export const HealthCheck = z.object({
    // Status of the service
    status: z.string().openapi({ description: 'Status of the service', example: 'OK' }),
    // Uptime in seconds
    uptime: z.string().openapi({ description: 'Uptime in seconds', example: '123456 seconds' }),
    // Message indicating server status
    message: z.string().openapi({ description: 'Message indicating server status', example: 'Server is running' }),
    // Timestamp of the health check
    timestamp: z.string().datetime().openapi({ description: 'Timestamp of the health check', example: '2021-09-01T12:00:00.000Z' }),
    // API version
    version: z.string().openapi({ description: 'Api version', example: '14.17.0' }),
    // Environment in which the server is running
    environment: z.string().openapi({ description: 'Environment in which the server is running', example: 'production' }),
    // Unix timestamp
    unix: z.number().openapi({ description: 'Unix timestamp', example: 1630512000000 })
}).openapi('HealthCheck', { description: 'Health check details' });

// TypeScript type for HealthCheck schema
export type HealthCheckType = z.infer<typeof HealthCheck>;

// TypeScript type for ResponseError schema
export type ResponseErrorType = z.infer<typeof ResponseError>;

// Creating a response schema that includes the HealthCheck schema
export const ResponseWithHealthCheck = createResponseSchema(HealthCheck);