import jwt from 'jsonwebtoken';
import { logger } from '../util/logger.js';
import key from '../util/key.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; 
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(400).json({ message: 'bad token' });
  } else {
    const user = await decodeJWT(token);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(400).json({ message: 'user token could not be verified' });
    }
  }
}

async function decodeJWT(token) {
  try {
    const user = await jwt.verify(token, key);
    return user;
  } catch (err) {
    logger.error(err);
    return null;
  }
}