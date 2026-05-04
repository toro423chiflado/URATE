const ACTION_MAP = {
  'create_class': { path: '/cursos', method: 'POST', requiresExchange: false },
  'update_class': { path: '/cursos', method: 'PUT', requiresExchange: false },
  'delete_class': { path: '/cursos', method: 'DELETE', requiresExchange: false },
  'view_grades':  { path: '/grades', method: 'GET', requiresExchange: false },
  'list_classes': { path: '/cursos', method: 'GET', requiresExchange: false }
};

function mapActionToPath(action) {
  return ACTION_MAP[action] || null;
}

module.exports = { mapActionToPath };
