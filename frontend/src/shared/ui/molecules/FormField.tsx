import { Label } from "@/shared/ui/atoms/label";
import { Input } from "@/shared/ui/atoms/input";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}

export function FormField({ id, label, type = "text", value, onChange, required, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
