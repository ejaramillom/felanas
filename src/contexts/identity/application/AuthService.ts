import jwt from 'jsonwebtoken';
import { User } from '../domain/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_do_not_use_in_production';

export class AuthService {
    static generateToken(user: User): string {
        return jwt.sign(
            { 
                userId: user.id, 
                companyId: user.companyId, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static verifyToken(token: string): any {
        return jwt.verify(token, JWT_SECRET);
    }
}