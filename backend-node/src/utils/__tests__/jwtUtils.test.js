const { generateAccessToken, generateRefreshToken, verifyToken, isTokenExpired, decodeToken, buildClaims, extractUsername } = require('../jwtUtils');

describe('jwtUtils test suite', () => {
  const mockUser = { id: 1, email: 'test@company.com', firstName: 'Test' };
  const mockRoles = ['ROLE_ADMIN'];

  test('should generate and verify JWT access tokens', () => {
    const claims = buildClaims(mockUser, mockRoles);
    const token = generateAccessToken(claims);
    
    expect(token).toBeDefined();
    
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.sub).toBe('test@company.com');
  });

  test('should detect token expiration states', () => {
    const claims = buildClaims(mockUser, mockRoles);
    const token = generateAccessToken(claims);
    expect(isTokenExpired(token)).toBe(false);
  });

  test('should decode token without verifying', () => {
    const claims = buildClaims(mockUser, mockRoles);
    const token = generateAccessToken(claims);
    const decoded = decodeToken(token);
    expect(decoded.userId).toBe(1);
  });
});
