import jwt from 'jsonwebtoken';
import { type StringValue } from 'ms'

const secret = process.env.JWT_SECRET!

export const generateToken = (payload: object, expiresIn: number | StringValue) => {
  return jwt.sign(payload, secret, { expiresIn });
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
