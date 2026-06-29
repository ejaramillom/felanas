import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(companyName: string, email: string, password: string, activationKey: string) {
    setLoading(true);
    setError(null);
    try {
      await register({ companyName, email, password, activationKey });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return { submit, error, loading };
}
