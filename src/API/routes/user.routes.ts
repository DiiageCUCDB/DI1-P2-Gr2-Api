import express from 'express';
import {
    registerUserHandler,
    loginHandler,
    getUsersHandler,
    getUserByIdHandler,
    validateCreateUser,
    validateLogin,
    validateUserId
} from '../user.controller';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
    CreateUserSchema,
    LoginSchema,
    ResponseWithLoginResponseSchema,
    ResponseWithCreateUserResponseSchema
} from '@/DTO/user.schema';

const router = express.Router();

// Register the path for retrieving all capteurs
registry.registerPath({
    method: 'post',
    path: '/api/users',
    summary: 'Register a new user',
    tags: ['Users'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateUserSchema,
                },
            }
        }
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: ResponseWithCreateUserResponseSchema,
                },
            },
        },
        400: {
            description: 'Invalid input',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
    },
});
// Apply Zod validation middleware before the handler
router.post('/', validateCreateUser, registerUserHandler);

registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    summary: 'Login user',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginSchema,
                },
            }
        }
    },
    responses: {
        200: {
            description: 'Successfully authenticated',
            content: {
                'application/json': {
                    schema: ResponseWithLoginResponseSchema,
                },
            },
        },
        401: {
            description: 'Invalid credentials',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
    },
});

// Apply Zod validation middleware before the handler
router.post('/auth/login', validateLogin, loginHandler);

registry.registerPath({
    method: 'get',
    path: '/api/users',
    summary: 'Get all users',
    tags: ['Users'],
    responses: {
        200: {
            description: 'List of users',
            content: {
                'application/json': {
                    schema: ResponseWithCreateUserResponseSchema,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
    },
});
router.get('/', getUsersHandler);

registry.registerPath({
    method: 'get',
    path: '/api/users/{id}',
    summary: 'Get user by ID',
    tags: ['Users'],
    parameters: [
        {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
                type: 'integer',
                description: 'ID of the user to retrieve',
                example: 1,
            },
        },
    ],
    responses: {
        200: {
            description: 'User found',
            content: {
                'application/json': {
                    schema: ResponseWithCreateUserResponseSchema,
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
        500: {
            description: 'Internal server error',
            content: {
                'application/json': {
                    schema: ResponseError,
                },
            },
        },
    },
});
// Apply Zod validation middleware before the handler
router.get('/:id', validateUserId, getUserByIdHandler);

export default router;