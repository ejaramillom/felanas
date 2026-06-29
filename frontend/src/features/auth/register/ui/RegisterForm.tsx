import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/shared/ui/atoms/card";
import { Button } from "@/shared/ui/atoms/button";
import { Alert, AlertDescription } from "@/shared/ui/atoms/alert";
import { FormField } from "@/shared/ui/molecules/FormField";
import { useRegister } from "../model/useRegister";

export function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const { submit, error, loading } = useRegister();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-[var(--color-brand)]">Create account</CardTitle>
        <CardDescription>Register your company workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(companyName, email, password, activationKey); }}
          className="space-y-4"
          id="register-form"
        >
          <FormField id="companyName" label="Company name" value={companyName} onChange={setCompanyName} required />
          <FormField id="email" label="Email" type="email" value={email} onChange={setEmail} required />
          <FormField id="password" label="Password" type="password" value={password} onChange={setPassword} required />
          <div className="space-y-1">
            <FormField id="activationKey" label="Activation key" value={activationKey} onChange={setActivationKey} required />
            <p className="text-xs text-muted-foreground">Your activation key was provided to your organization.</p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" form="register-form" className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)]" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-brand)] hover:underline">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
