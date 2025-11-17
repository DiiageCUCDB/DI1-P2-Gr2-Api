// Import necessary modules and types from server.schema
import { createResponseSchema, ResponseError, ResponseErrorType, HealthCheck } from '@/DTO/server.schema';

// Describe the test suite for server.schema
describe('Server.schema tests', () => {
    // Describe the test suite for Response schema
    describe('Response schema', () => {
        // Create a Response schema with HealthCheck
        const ResponseWithHealthCheck = createResponseSchema(HealthCheck);

        // Test case for validating a correct ResponseWithHealthCheck object
        it('should validate a correct ResponseWithHealthCheck object', () => {
            // Define a valid ResponseWithHealthCheck object
            const validResponse = {
                result: {
                    status: 'OK',
                    uptime: '123456 seconds',
                    message: 'Server is running',
                    timestamp: '2021-09-01T12:00:00.000Z',
                    version: '14.17.0',
                    environment: 'production',
                    unix: 1630512000000
                },
                results: [
                    {
                        status: 'OK',
                        uptime: '123456 seconds',
                        message: 'Server is running',
                        timestamp: '2021-09-01T12:00:00.000Z',
                        version: '14.17.0',
                        environment: 'production',
                        unix: 1630512000000
                    }
                ],
                generationTime_ms: 123.456,
                success: true,
                message: 'Success'
            };
            // Expect the ResponseWithHealthCheck object to be parsed without throwing an error
            expect(() => ResponseWithHealthCheck.parse(validResponse)).not.toThrow();
        });

        // Test case for invalidating an incorrect ResponseWithHealthCheck object
        it('should invalidate an incorrect ResponseWithHealthCheck object', () => {
            // Define an invalid ResponseWithHealthCheck object
            const invalidResponse = {
                result: {
                    status: 'OK',
                    uptime: '123456 seconds',
                    message: 'Server is running',
                    timestamp: '2021-09-01T12:00:00.000Z',
                    version: '14.17.0',
                    environment : 'production',
                    unix: 1630512000000
                },
                results: 'invalid-results',
                generationTime_ms: 'invalid-generationtime',
                success: true,
                message: 'Success'
            };
            // Expect the ResponseWithHealthCheck object to throw an error when parsed
            expect(() => ResponseWithHealthCheck.parse(invalidResponse)).toThrow();
        });
    });

    // Describe the test suite for ResponseError schema
    describe('ResponseError schema', () => {

        // Test case for validating a correct ResponseError object
        it('should validate a correct ResponseError object', () => {
            // Define a valid ResponseError object
            const validResponseError: ResponseErrorType = {
                generationTime_ms: '123456ms',
                success: false,
                message: 'Error',
                error: { detail: 'Some error detail' }
            };
            // Expect the ResponseError object to be parsed without throwing an error
            expect(() => ResponseError.parse(validResponseError)).not.toThrow();
        });
    });
});