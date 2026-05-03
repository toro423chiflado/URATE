const fs = require('fs');
const path = require('path');

let policy = { actions: {}, read_actions: [] };

try {
  const data = fs.readFileSync(path.join(__dirname, '../../rbac_policy.json'), 'utf8');
  policy = JSON.parse(data);
} catch (error) {
  console.warn('Could not load rbac_policy.json', error.message);
}

function isAllowed(action, userRoles) {
  if (!action) return false;
  if (!userRoles || !Array.isArray(userRoles)) return false;

  const rolesUpper = userRoles.map(r => String(r).toUpperCase());

  // If it's a known read action without strict RBAC mapping, let's assume allowed for any valid role
  // Or check if it has a specific mapping
  if (policy.actions[action]) {
    const allowedRoles = policy.actions[action].map(r => String(r).toUpperCase());
    return rolesUpper.some(role => allowedRoles.includes(role));
  }

  if (policy.read_actions.includes(action)) {
    return true; // Allow if it's a simple read action explicitly listed
  }

  return false;
}

module.exports = { isAllowed };
