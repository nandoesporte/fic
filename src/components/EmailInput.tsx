import { Input } from "@/components/ui/input";

interface EmailInputProps {
  email: string;
  onChange: (email: string) => void;
}

export const EmailInput = ({ email, onChange }: EmailInputProps) => {
  return (
    <div className="mb-6">
      <Input
        type="email"
        placeholder="Digite seu e-mail para acessar"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-full"
        autoComplete="email"
        required
      />
    </div>
  );
};