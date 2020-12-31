const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      const error = new HttpError('Authentication failed, token', 403);
      return next(error);
    }

    const decodedToken = jwt.verify(token, 'supersecret_string');
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed', 403);
    return next(error);
  }
} 
