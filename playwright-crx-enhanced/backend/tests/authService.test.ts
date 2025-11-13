import { AuthService } from '../src/services/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should generate an access token', () => {
    const token = authService['generateAccessToken']('123', 'test@example.com');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should generate a refresh token', () => {
    const token = authService['generateRefreshToken']('123');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
