import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userModel } from '../orm/schemas/userSchemas';
import { User } from '../interfaces/User';

// 擴展 Request 介面以包含用戶資訊
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ code: 401, message: 'Access token required', body: null });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
        const user = await userModel.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ code: 401, message: 'Invalid token', body: null });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ code: 403, message: 'Invalid or expired token', body: null });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ code: 401, message: 'Authentication required', body: null });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ code: 403, message: 'Insufficient permissions', body: null });
        }

        next();
    };
};
