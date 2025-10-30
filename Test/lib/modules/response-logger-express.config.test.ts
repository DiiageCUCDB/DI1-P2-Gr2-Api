import { configureResponseLogger } from '@/lib/modules/response-logger-express.config';
import { mockRequest, mockResponse, mockNext } from '../../../__mocks__/test-utils';
import logger from '@/lib/docs/logger';

describe('Response Logger Middleware', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof mockNext>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
  });

  it('should call routeStart on request', () => {
    configureResponseLogger(logger)(req, res, next);
    expect(logger.routeStart).toHaveBeenCalledWith(req);
  });

  it('should override res.json to format successful response', () => {
    const originalJson = res.json;
    const middleware = configureResponseLogger(logger);
    middleware(req, res, next);

    const testPayload = { data: 'test' };
    res.json(testPayload);

    // Now we can check the _json mock which will have received the formatted response
    expect(originalJson).toHaveBeenCalledWith({
      result: { data: 'test' },
      generationTime_ms: expect.any(Number),
      success: true,
      message: 'Success'
    });
  });

  it('should override res.json to format error response', () => {
    const originalJson = res.json;
    const middleware = configureResponseLogger(logger);
    middleware(req, res, next);

    const testPayload = { isSuccess: false, message: 'Error', error: 'Test error' };
    res.json(testPayload);

    expect(originalJson).toHaveBeenCalledWith({
      success: false,
      message: 'Error',
      error: 'Test error',
      generationTime_ms: expect.any(Number)
    });
  });

  it('should call routeEnd when response finishes', () => {
    const middleware = configureResponseLogger(logger);
    middleware(req, res, next);

    // Simulate response finish
    const finishCallback = (res.on as jest.Mock).mock.calls[0][1];
    finishCallback();

    expect(logger.routeEnd).toHaveBeenCalledWith(
      req,
      res,
      'mock-request-id',
      expect.any(Number)
    );
  });

  it('should call next()', () => {
    configureResponseLogger(logger)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});