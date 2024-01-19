import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import CustomAPIError from "../error/custom-error";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  // Extracting tokens from cookies
  const authToken = req.cookies.authToken;
  const refreshToken = req.cookies.refreshToken;

  if (!authToken || !refreshToken) {
    return res
      .status(401)
      .json({ message: "No authToken or refreshToken is provided " });
  }

  // verifying the takens
  jwt.verify(
    authToken,
    process.env.JWT_SECRET_KEY || "",
    (err: any, decode: any) => {
      if (err) {
        jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET_KEY || "",
          (refreshErr: any, refreshDecode: any) => {
            if (refreshErr) {
              return res
                .status(401)
                .json({ message: "Both tokens are invalid" });
            } else {
              const newAuthToken = jwt.sign(
                { userId: refreshDecode.userId },
                process.env.JWT_SECRET_KEY || "",
                { expiresIn: "30m" }
              );
              const newRefreshToken = jwt.sign(
                { userId: refreshDecode.userId },
                process.env.JWT_REFRESH_SECRET_KEY || "",
                { expiresIn: "2h" }
              );

              res.cookie("authToken", newAuthToken, { httpOnly: true });
              res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
              req.userId = refreshDecode?.id;
              next();
            }
          }
        );
      } else {
        req.userId = decode?.id;
        next();
      }
    }
  );
};

export const ownership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const authToken = req.cookies.authToken;

    const decodedToken = jwt.verify(
      authToken,
      process.env.JWT_SECRET_KEY || ""
    ) as { userId: string };
    const userId = decodedToken.userId;

    if (!userId) {
      throw new CustomAPIError("User does't exist");
    }

    if (userId !== id) {
      throw new CustomAPIError("You are not alloweded to delete other user");
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
