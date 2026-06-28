const { calculate } = require('../healthScoreCalculator');

describe('healthScoreCalculator test suite', () => {
  test('should calculate excellent score for a brand new asset', () => {
    const warrantyExpiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    const result = calculate(new Date(), 5, 0, 0, 100000, 0, warrantyExpiry);
    
    expect(result.healthScore).toBeGreaterThanOrEqual(85);
    expect(result.healthLevel).toBe('EXCELLENT');
    expect(result.riskLevel).toBe('LOW');
  });
});
