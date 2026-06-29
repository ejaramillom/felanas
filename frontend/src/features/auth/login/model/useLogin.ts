import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return { submit, error, loading };
}
