import { AuthFormLayout } from "@/widgets/auth-form/AuthFormLayout";
import { LoginForm } from "@/features/auth/login/ui/LoginForm";

export default function LoginPage() {
  return (
    <AuthFormLayout>
      <LoginForm />
    </AuthFormLayout>
  );
}
