import { z } from 'zod';
import { createZodValidator, validateRequest, validateResponse } from '@/lib/modules/zod-validator-express.config';
import { mockRequest, mockResponse, mockNext, mockLogger } from '../../../__mocks__/test-utils';

describe('Zod Validator Middleware', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof mockNext>;
  let logger: ReturnType<typeof mockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
    logger = mockLogger();
  });

  describe('createZodValidator - body validation', () => {
    it('should pass validation with valid body data', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      req.body = { name: 'John', age: 30 };
      
      const middleware = createZodValidator({
        schemas: { body: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John', age: 30 });
    });

    it('should fail validation with invalid body data', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      req.body = { name: 'John', age: 'not a number' };
      
      const middleware = createZodValidator({
        schemas: { body: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Invalid request body',
        error: expect.objectContaining({
          issues: expect.any(Array)
        })
      });
    });

    it('should reject extra fields when strict mode is enabled', async () => {
      const schema = z.object({
        name: z.string()
      });

      req.body = { name: 'John', extraField: 'not allowed' };
      
      const middleware = createZodValidator({
        schemas: { body: schema },
        logger,
        strict: true
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should allow extra fields when strict mode is disabled', async () => {
      const schema = z.object({
        name: z.string()
      });

      req.body = { name: 'John', extraField: 'allowed' };
      
      const middleware = createZodValidator({
        schemas: { body: schema },
        logger,
        strict: false
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('createZodValidator - params validation', () => {
    it('should pass validation with valid params', async () => {
      const schema = z.object({
        id: z.string()
      });

      req.params = { id: '123' };
      
      const middleware = createZodValidator({
        schemas: { params: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid params', async () => {
      const schema = z.object({
        id: z.string().uuid()
      });

      req.params = { id: 'not-a-uuid' };
      
      const middleware = createZodValidator({
        schemas: { params: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Invalid request params',
        error: expect.objectContaining({
          issues: expect.any(Array)
        })
      });
    });
  });

  describe('createZodValidator - query validation', () => {
    it('should pass validation with valid query params', async () => {
      const schema = z.object({
        page: z.string(),
        limit: z.string()
      });

      req.query = { page: '1', limit: '10' };
      
      const middleware = createZodValidator({
        schemas: { query: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid query params', async () => {
      const schema = z.object({
        page: z.string().min(1)
      });

      req.query = { page: '' };
      
      const middleware = createZodValidator({
        schemas: { query: schema },
        logger
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Invalid request query',
        error: expect.objectContaining({
          issues: expect.any(Array)
        })
      });
    });
  });

  describe('createZodValidator - headers validation', () => {
    it('should pass validation with valid headers', async () => {
      const schema = z.object({
        'content-type': z.string(),
        'authorization': z.string().optional()
      });

      req.headers = { 'content-type': 'application/json' };
      
      const middleware = createZodValidator({
        schemas: { headers: schema },
        logger,
        strict: false
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid headers', async () => {
      const schema = z.object({
        'authorization': z.string()
      });

      req.headers = {};
      
      const middleware = createZodValidator({
        schemas: { headers: schema },
        logger,
        strict: false
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Invalid request headers',
        error: expect.objectContaining({
          issues: expect.any(Array)
        })
      });
    });
  });

  describe('createZodValidator - response validation', () => {
    it('should validate response data successfully', async () => {
      const responseSchema = z.object({
        status: z.string(),
        message: z.string()
      });

      const originalJson = res.json;
      const jsonSpy = jest.fn(originalJson);
      res.json = jsonSpy;

      const middleware = createZodValidator({
        schemas: { response: responseSchema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      // Simulate sending a valid response
      const responseData = { status: 'OK', message: 'Success' };
      res.json(responseData);

      expect(jsonSpy).toHaveBeenCalledWith(responseData);
    });

    it('should reject invalid response data', async () => {
      const responseSchema = z.object({
        status: z.string(),
        message: z.string()
      });

      const originalJson = res.json;
      const jsonSpy = jest.fn(originalJson);
      res.json = jsonSpy;

      const middleware = createZodValidator({
        schemas: { response: responseSchema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      // Simulate sending an invalid response
      const responseData = { status: 'OK', message: 123 }; // message should be string
      res.json(responseData);

      expect(jsonSpy).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Internal server error',
        error: 'Response validation failed'
      });
    });
  });

  describe('createZodValidator - multiple validations', () => {
    it('should validate both body and params together', async () => {
      const bodySchema = z.object({
        name: z.string()
      });
      const paramsSchema = z.object({
        id: z.string()
      });

      req.body = { name: 'John' };
      req.params = { id: '123' };
      
      const middleware = createZodValidator({
        schemas: { body: bodySchema, params: paramsSchema },
        logger
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail if any validation fails', async () => {
      const bodySchema = z.object({
        name: z.string()
      });
      const paramsSchema = z.object({
        id: z.string()
      });

      req.body = { name: 'John' };
      req.params = {}; // Missing id
      
      const middleware = createZodValidator({
        schemas: { body: bodySchema, params: paramsSchema },
        logger
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Invalid request params',
        error: expect.objectContaining({
          issues: expect.any(Array)
        })
      });
    });
  });

  describe('validateRequest helper', () => {
    it('should create a validator for body', async () => {
      const schema = z.object({
        email: z.string().email()
      });

      req.body = { email: 'test@example.com' };
      
      const middleware = validateRequest('body', schema, logger);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should create a validator for params', async () => {
      const schema = z.object({
        userId: z.string()
      });

      req.params = { userId: '456' };
      
      const middleware = validateRequest('params', schema, logger);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateResponse helper', () => {
    it('should create a response validator', async () => {
      const schema = z.object({
        data: z.string()
      });

      const originalJson = res.json;
      const jsonSpy = jest.fn(originalJson);
      res.json = jsonSpy;

      const middleware = validateResponse(schema, logger);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();

      // Simulate valid response
      res.json({ data: 'test' });
      expect(jsonSpy).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      const schema = z.object({
        name: z.string()
      });

      // Mock schema.safeParse to throw an error
      jest.spyOn(schema, 'safeParse').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      req.body = { name: 'John' };
      
      const middleware = createZodValidator({
        schemas: { body: schema },
        logger,
        strict: false
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        isSuccess: false,
        message: 'Internal server error',
        error: 'Validation failed'
      });
    });
  });

  describe('without logger', () => {
    it('should work without a logger', async () => {
      const schema = z.object({
        name: z.string()
      });

      req.body = { name: 'John' };
      
      const middleware = createZodValidator({
        schemas: { body: schema }
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
