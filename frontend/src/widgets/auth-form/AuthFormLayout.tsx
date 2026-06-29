import type { ReactNode } from "react";
import logo from "@/assets/logo.png";

interface Props { children: ReactNode }

export function AuthFormLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="Felanas" className="h-14 w-auto" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Workforce management platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
