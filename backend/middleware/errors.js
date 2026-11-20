const multer = require('multer');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({ message: tooLarge ? 'Resume exceeds 5 MB' : 'Invalid resume upload' });
  }
  if (error.type === 'entity.parse.failed' || error instanceof URIError) {
    return res.status(400).json({ message: 'Malformed request' });
  }
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large' });
  if (['encoding.unsupported', 'charset.unsupported'].includes(error.type)) {
    return res.status(415).json({ message: 'Unsupported request encoding' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid input' });
  }
  if (error.code === 11000) return res.status(409).json({ message: 'Record already exists' });
  console.error(JSON.stringify({ event: 'request_failed', requestId: req.id }));
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = { HttpError, asyncHandler, handleError };
