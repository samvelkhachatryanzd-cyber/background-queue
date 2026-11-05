class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class ValidationError extends HttpError {
  constructor(message, details) {
    super(400, message, details);
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

module.exports = { HttpError, ValidationError, NotFoundError, ConflictError };
