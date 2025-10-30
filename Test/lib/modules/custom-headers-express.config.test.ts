import { configureCustomHeaders } from '@/lib/modules/custom-headers-express.config';
import { mockRequest, mockResponse, mockNext } from '../../../__mocks__/test-utils';
import { packageJson } from '@/lib/config/env.config';

describe('Custom Headers Middleware', () => {
  it('should remove X-Powered-By and Server headers', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    configureCustomHeaders()(req, res, next);

    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(res.removeHeader).toHaveBeenCalledWith('Server');
  });

  it('should add custom headers', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    configureCustomHeaders()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('apiName', packageJson.name);
    expect(res.setHeader).toHaveBeenCalledWith('apiVersion', packageJson.version);
  });

  it('should call next()', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    configureCustomHeaders()(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});