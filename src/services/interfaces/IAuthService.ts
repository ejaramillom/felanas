import { User } from "../../entities/User.js";

export interface IAuthService {
    validateUser(username: string, password: string): Promise<User | null>;
    generateToken(user: User): string;
}
