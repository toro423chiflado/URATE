const ACTION_MAP = {
  'create_class': { path: '/classes', method: 'POST', requiresExchange: true },
  'update_class': { path: '/classes', method: 'PUT', requiresExchange: true },
  'delete_class': { path: '/classes', method: 'DELETE', requiresExchange: true },
  'view_grades': { path: '/grades', method: 'GET', requiresExchange: false },
  'list_classes': { path: '/classes', method: 'GET', requiresExchange: false }
};

function mapActionToPath(action) {
  return ACTION_MAP[action] || null;
}

module.exports = { mapActionToPath };
