const { mapActionToPath } = require('../src/lib/mapper');

describe('Mapper Module', () => {
  it('should map create_class to POST /classes with exchange required', () => {
    const result = mapActionToPath('create_class');
    expect(result).toEqual({ path: '/classes', method: 'POST', requiresExchange: true });
  });

  it('should map view_grades to GET /grades without exchange required', () => {
    const result = mapActionToPath('view_grades');
    expect(result).toEqual({ path: '/grades', method: 'GET', requiresExchange: false });
  });

  it('should return null for unknown actions', () => {
    expect(mapActionToPath('unknown')).toBeNull();
  });
});
