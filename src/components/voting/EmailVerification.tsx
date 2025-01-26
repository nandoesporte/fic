import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/EmailInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EmailVerificationProps {
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: () => void;
}

export const EmailVerification = ({ email, onEmailChange, onVerified }: EmailVerificationProps) => {
  const verifyEmail = async () => {
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    const { data, error } = await supabase
      .from('registered_voters')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error verifying email:', error);
      toast.error('Erro ao verificar email');
      return;
    }

    if (!data) {
      toast.error('Email não encontrado no sistema');
      return;
    }

    onVerified();
    toast.success('Email verificado com sucesso!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="mt-2 text-gray-500">Digite seu email cadastrado para acessar o sistema de votação</p>
        </div>
        <EmailInput email={email} onChange={onEmailChange} />
        <Button 
          className="w-full" 
          onClick={verifyEmail}
        >
          Acessar Sistema de Votação
        </Button>
      </div>
    </div>
  );
};