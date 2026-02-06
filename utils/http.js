const STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
});

const MSG = Object.freeze({
  // Generic/common validation + server messages
  REQUIRED_FIELDS: "All filled must be required",
  REQUIRED_FIELD: "All field required",
  INTERNAL_SERVER_ERROR: "Internal Server Error",

  // Common CRUD messages
  NOT_FOUND: "Not found",
});

module.exports = { STATUS, MSG };
