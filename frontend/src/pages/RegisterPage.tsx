import { AuthFormLayout } from "@/widgets/auth-form/AuthFormLayout";
import { RegisterForm } from "@/features/auth/register/ui/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthFormLayout>
      <RegisterForm />
    </AuthFormLayout>
  );
}
