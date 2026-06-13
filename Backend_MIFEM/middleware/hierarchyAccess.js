const hierarchyScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = req.user;
  const roleName = user.role ? (user.role.name || user.role) : '';

  if (roleName === 'SUPER_ADMIN') {
    req.hierarchyScope = { level: 'ALL', ids: {} };
    return next();
  }

  const scope = {
    level: 'NONE',
    ids: {},
  };

  if (user.unionId) {
    scope.level = 'UNION';
    scope.ids = { unionId: user.unionId };
  }
  if (user.fieldId) {
    scope.level = 'FIELD';
    scope.ids = { unionId: user.unionId, fieldId: user.fieldId };
  }
  if (user.districtId) {
    scope.level = 'DISTRICT';
    scope.ids = { unionId: user.unionId, fieldId: user.fieldId, districtId: user.districtId };
  }
  if (user.churchId) {
    scope.level = 'CHURCH';
    scope.ids = { unionId: user.unionId, fieldId: user.fieldId, districtId: user.districtId, churchId: user.churchId };
  }
  if (user.ministryId) {
    scope.level = 'MINISTRY';
    scope.ids = { unionId: user.unionId, fieldId: user.fieldId, districtId: user.districtId, churchId: user.churchId, ministryId: user.ministryId };
  }

  req.hierarchyScope = scope;
  next();
};

const addHierarchyFilter = (req, queryOptions = {}) => {
  if (!req.hierarchyScope || req.hierarchyScope.level === 'ALL') {
    return queryOptions;
  }

  const where = { ...queryOptions.where };
  const scope = req.hierarchyScope;

  if (scope.ids.unionId && queryOptions.modelIncludes?.unionId !== false) {
    where.unionId = scope.ids.unionId;
  }
  if (scope.ids.fieldId && queryOptions.modelIncludes?.fieldId !== false) {
    where.fieldId = scope.ids.fieldId;
  }
  if (scope.ids.districtId && queryOptions.modelIncludes?.districtId !== false) {
    where.districtId = scope.ids.districtId;
  }
  if (scope.ids.churchId && queryOptions.modelIncludes?.churchId !== false) {
    where.churchId = scope.ids.churchId;
  }
  if (scope.ids.ministryId && queryOptions.modelIncludes?.ministryId !== false) {
    where.ministryId = scope.ids.ministryId;
  }

  return { ...queryOptions, where };
};

module.exports = { hierarchyScope, addHierarchyFilter };
