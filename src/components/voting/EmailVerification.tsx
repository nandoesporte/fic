import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/EmailInput";

interface EmailVerificationProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerify: () => void;
}

export const EmailVerification = ({ email, onEmailChange, onVerify }: EmailVerificationProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="mt-2 text-gray-500">Digite seu email cadastrado para acessar o sistema de votação</p>
        </div>
        <EmailInput email={email} onChange={onEmailChange} />
        <Button className="w-full" onClick={onVerify}>
          Acessar Sistema de Votação
        </Button>
      </div>
    </div>
  );
};