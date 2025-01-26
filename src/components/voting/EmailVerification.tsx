import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmailInput } from "@/components/EmailInput";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EmailVerificationProps {
  onVerified: (email: string) => void;
}

export const EmailVerification = ({ onVerified }: EmailVerificationProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmail = async () => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('Verificando email:', userEmail);
      const { data, error } = await supabase
        .from('registered_voters')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar email:', error);
        toast.error('Erro ao verificar email');
        return;
      }

      if (!data) {
        toast.error('Email não encontrado no sistema');
        return;
      }

      onVerified(userEmail);
      toast.success('Email verificado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao verificar email');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="mt-2 text-gray-500">Digite seu email cadastrado para acessar o sistema de votação</p>
        </div>
        <EmailInput email={userEmail} onChange={setUserEmail} />
        <Button 
          className="w-full" 
          onClick={verifyEmail}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Acessar Sistema de Votação'
          )}
        </Button>
      </div>
    </div>
  );
};