const { calculate, getCurrentFinancialYear } = require('../depreciationCalculator');

describe('depreciationCalculator test suite', () => {
  test('should calculate straight-line depreciation correctly', () => {
    const result = calculate(100000, 5, new Date());
    expect(result.currentValue).toBe(100000);
    expect(result.salvageValue).toBe(5000);
    expect(result.yearsElapsed).toBe(0);
  });

  test('should compute financial year string properly', () => {
    const fy = getCurrentFinancialYear();
    expect(fy).toMatch(/^\d{4}-\d{2}$/);
  });
});
