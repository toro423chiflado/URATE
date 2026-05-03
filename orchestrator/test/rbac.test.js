const { isAllowed } = require('../src/lib/rbac');

describe('RBAC Module', () => {
  it('should allow PROFESOR to create_class', () => {
    expect(isAllowed('create_class', ['PROFESOR'])).toBe(true);
  });

  it('should allow ADMIN to delete_class', () => {
    expect(isAllowed('delete_class', ['ADMIN'])).toBe(true);
  });

  it('should deny ALUMNO to create_class', () => {
    expect(isAllowed('create_class', ['ALUMNO'])).toBe(false);
  });

  it('should allow ALUMNO to view_grades (read_action)', () => {
    expect(isAllowed('view_grades', ['ALUMNO'])).toBe(true);
  });

  it('should deny unknown action', () => {
    expect(isAllowed('hack_system', ['ADMIN'])).toBe(false);
  });
});
