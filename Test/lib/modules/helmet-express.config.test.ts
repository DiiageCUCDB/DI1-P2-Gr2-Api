import { configureHelmet } from '@/lib/modules/helmet-express.config';
import helmet from 'helmet';

jest.mock('helmet');

describe('Helmet Configuration', () => {
  it('should call helmet with correct configuration', () => {
    const helmetMock = helmet as jest.MockedFunction<typeof helmet>;
    configureHelmet();
    
    expect(helmetMock).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          'script-src': ['\'self\'', 'https://cdn.jsdelivr.net'],
        },
      },
    });
  });
});