export interface UserProfile {
  id: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "VIEWER";
  companyId: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  trialEndsAt?: string;
}
