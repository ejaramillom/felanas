import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/shared/ui/atoms/card";
import { Button } from "@/shared/ui/atoms/button";
import { Alert, AlertDescription } from "@/shared/ui/atoms/alert";
import { FormField } from "@/shared/ui/molecules/FormField";
import { useLogin } from "../model/useLogin";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { submit, error, loading } = useLogin();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[var(--color-brand)]">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(email, password); }}
          className="space-y-4"
          id="login-form"
        >
          <FormField id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <FormField id="password" label="Password" type="password" value={password} onChange={setPassword} required />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" form="login-form" className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)]" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--color-brand)] hover:underline">Register</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
