import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction){
   try {
        
    /**
     *  const token = req.headers.authorization?.split(" ")[1]; 
     */
     const token = (req.headers as Record<string, string>).authorization?.split(" ")[1];

       if(!token){
           return res.status(401).json({ message: '認証トークンがありません'});
       }
      
       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
       req.user = decoded as { userId: number, email: string}
       next();
   } catch(error){
        res.status(403).json({message: '無効な認証トークンです'})
   }
}
