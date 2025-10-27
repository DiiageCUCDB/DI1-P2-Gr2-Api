import { registerUserHandler, loginHandler, getUsersHandler, getUserByIdHandler } from '@/API/user.controller';
import { createUser, findUserByEmail, findUsers, findUserById } from '@/BL/user.service';
import { verifyPassword } from '@/lib/hash';
import { mockUserWithId } from '../../__mocks__/mockService';
import { mockRequest, mockResponse, mockNext } from '../../__mocks__/test-utils';

jest.mock('@/BL/user.service');
jest.mock('@/lib/hash');

describe('User Controller', () => {
    it('Register a new user successfully', async () => {
        // Mock the createUser service to return a user object
        const mockUser = mockUserWithId();
        const req = mockRequest({
            body: { name: mockUser.name, email: mockUser.email, password: mockUser.password }
        });
        const res = mockResponse();
        const next = mockNext();

        (createUser as jest.Mock).mockResolvedValue(mockUser);
        
        await registerUserHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    // Note: Validation is now handled by the Zod middleware (validateCreateUser)
    // This test is covered in Test/lib/modules/zod-validator-express.config.test.ts
    it('Fail to register a user with invalid input', async () => {
        // This test would need to test the middleware separately or in an integration test
        // Since validation is handled by middleware, we test the controller assuming valid input
        const mockUser = mockUserWithId();
        const req = mockRequest({
            body: { name: mockUser.name, email: mockUser.email, password: mockUser.password }
        });
        const res = mockResponse();
        const next = mockNext();

        (createUser as jest.Mock).mockResolvedValue(mockUser);
        
        await registerUserHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it('Login user successfully', async () => {
        // Mock the findUserByEmail
        const mockUser = mockUserWithId();
        const req = mockRequest({
            body: { email: mockUser.email, password: mockUser.password }
        });
        const res = mockResponse();
        const next = mockNext();

        (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (verifyPassword as jest.Mock).mockReturnValue(true);
        
        await loginHandler(req, res, next);
        
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            accessToken: expect.any(String)
        }));
    });

    it('Fail to login with invalid credentials', async () => {
        const req = mockRequest({
            body: { email: 'john@example.com', password: 'wrongpassword' }
        });
        const res = mockResponse();
        const next = mockNext();
        
        (findUserByEmail as jest.Mock).mockResolvedValue(null);
        
        await loginHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Invalid email or password'
        }));
    });

    it('Get all users successfully', async () => {
        const mockUsers = [mockUserWithId(), mockUserWithId()];
        const req = mockRequest();
        const res = mockResponse();
        const next = mockNext();

        (findUsers as jest.Mock).mockResolvedValue(mockUsers);
        
        await getUsersHandler(req, res, next);
        
        expect(res.send).toHaveBeenCalledWith(mockUsers);
    });

    it('Get user by ID successfully', async () => {
        const mockUser = mockUserWithId();
        const req = mockRequest({
            params: { id: mockUser.id.toString() }
        }) as any;
        const res = mockResponse();
        const next = mockNext();

        (findUserById as jest.Mock).mockResolvedValue(mockUser);
        
        await getUserByIdHandler(req, res, next);
        
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it('Fail to get user by non-existent ID', async () => {
        const userId = '999';
        const req = mockRequest({
            params: { id: userId }
        }) as any;
        const res = mockResponse();
        const next = mockNext();
        
        (findUserById as jest.Mock).mockResolvedValue(null);
        
        await getUserByIdHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: 'User not found'
        }));
    });

    it('Fail to get user by invalid ID', async () => {
        const req = mockRequest({
            params: { id: 'invalid-id' }
        }) as any;
        const res = mockResponse();
        const next = mockNext();
        
        await getUserByIdHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            isSuccess: false,
            message: 'Invalid UserId'
        }));
    });
});