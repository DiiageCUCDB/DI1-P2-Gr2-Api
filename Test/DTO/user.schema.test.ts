import { CreateUserSchema, LoginSchema, CreateUserResponseSchema, LoginResponseSchema } from '@/DTO/user.schema';

describe('User Schemas', () => {
    it('should validate CreateUserSchema', () => {
        const validData = {
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123',
        };

        expect(() => CreateUserSchema.parse(validData)).not.toThrow();

        const invalidData = {
            email: 'invalid-email',
            name: 'Test User',
            password: 'short',
        };

        expect(() => CreateUserSchema.parse(invalidData)).toThrow();
    });

    it('should validate LoginSchema', () => {
        const validData = {
            email: 'test@example.com',
            password: 'password123',
        };

        expect(() => LoginSchema.parse(validData)).not.toThrow();

        const invalidData = {
            email: 'invalid-email',
            password: 'password123',
        };

        expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should validate CreateUserResponseSchema', () => {
        const validData = {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
        };

        expect(() => CreateUserResponseSchema.parse(validData)).not.toThrow();

        const invalidData = {
            id: 'not-a-number',
            email: 'test@example.com',
            name: 'Test User',
        };

        expect(() => CreateUserResponseSchema.parse(invalidData)).toThrow();
    });

    it('should validate LoginResponseSchema', () => {
        const validData = {
            accessToken: 'someaccesstoken',
        };

        expect(() => LoginResponseSchema.parse(validData)).not.toThrow();

        const invalidData = {
            accessToken: 12345,
        };

        expect(() => LoginResponseSchema.parse(invalidData)).toThrow();
    });
});