const { mapActionToPath } = require('../src/lib/mapper');

describe('Mapper Module', () => {
  it('should map create_class to POST /cursos with exchange not required for now', () => {
    const result = mapActionToPath('create_class');
    expect(result).toEqual({ path: '/cursos', method: 'POST', requiresExchange: false });
  });

  it('should map view_grades to GET /grades without exchange required', () => {
    const result = mapActionToPath('view_grades');
    expect(result).toEqual({ path: '/grades', method: 'GET', requiresExchange: false });
  });

  it('should return null for unknown actions', () => {
    expect(mapActionToPath('unknown')).toBeNull();
  });
});
