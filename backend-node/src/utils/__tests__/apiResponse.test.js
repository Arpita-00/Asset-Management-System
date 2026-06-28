const { ApiResponse, PagedResponse } = require('../apiResponse');

describe('apiResponse test suite', () => {
  test('should generate standard success structures', () => {
    const res = ApiResponse.success({ val: 123 }, 'Done');
    expect(res.success).toBe(true);
    expect(res.status).toBe(200);
    expect(res.message).toBe('Done');
    expect(res.data.val).toBe(123);
  });

  test('should construct created responses', () => {
    const res = ApiResponse.created({ id: 1 }, 'Created');
    expect(res.status).toBe(201);
    expect(res.success).toBe(true);
  });

  test('should wrap paged content correctly', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const paged = PagedResponse.from(rows, 10, 0, 2);
    
    expect(paged.content).toEqual(rows);
    expect(paged.page).toBe(0);
    expect(paged.size).toBe(2);
    expect(paged.totalElements).toBe(10);
    expect(paged.totalPages).toBe(5);
    expect(paged.first).toBe(true);
    expect(paged.last).toBe(false);
  });
});
