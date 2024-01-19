import { NextFunction, Request, Response } from "express";
import CustomAPIError from "../error/custom-error";

const errorHandlerMiddleware = async (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomAPIError) {
    return res.status(404).json({ msg: err.message });
  }
  next(err);
};

export default errorHandlerMiddleware;
