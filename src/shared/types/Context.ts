export interface CurrentContext {
    companyId: string;
    userId: string;
    userRole: string;
}

declare global {
    namespace Express {
        interface Request {
            context?: CurrentContext;
        }
    }
}