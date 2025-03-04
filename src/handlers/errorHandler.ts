import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import Utilities from '../services/Utilities';

const file = new winston.transports.File({
  filename: '../logs/error.log',
  level: 'error',
  handleExceptions: true,
});

export function unCoughtErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  winston.error(JSON.stringify(err));
  res.end({ error: err });
}

export function apiErrorHandler(
  err: any,
  req: Request,
  res: Response,
  message: string,
) {
  const error: object = { Message: message, Request: req, Stack: err };
  console.log(error);
  winston.error(JSON.stringify(error, Utilities.GetCircularReplacer));
  res.json({ Message: message });
}
