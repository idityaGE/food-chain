import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/services/tokenService";
import { ApiError } from "@/utils/ApiError";
import { prisma } from "@/db";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await prisma.stakeholder.findUnique({
      where: {
        id: (decoded as any).id
      }
    });
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    const { password, walletAddress, ...userData } = user;

    req.user = userData;

    next();
  } catch (error: any) {
    next(new ApiError(401, error.message || "Authentication failed"));
  }
};