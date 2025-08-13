import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmailInput } from "@/components/EmailInput";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { votingToasts } from "./VotingToast";

interface EmailVerificationProps {
  onVerified: (email: string) => void;
}

export const EmailVerification = ({ onVerified }: EmailVerificationProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmail = async () => {
    if (!userEmail) {
      votingToasts.error('Email obrigatório', 'Por favor, insira seu email para continuar.');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('Verificando email:', userEmail);
      
      // Query the registered_voters table
      const { data: voter, error } = await supabase
        .from('registered_voters')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar email:', error);
        votingToasts.error('Erro de conexão', 'Erro ao verificar email. Por favor, tente novamente.');
        return;
      }

      if (!voter) {
        console.log('Email não encontrado:', userEmail);
        votingToasts.emailNotFound();
        return;
      }

      console.log('Email verificado com sucesso:', voter);
      onVerified(userEmail);
      votingToasts.emailVerified();
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      votingToasts.error('Erro inesperado', 'Erro ao verificar email. Por favor, tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyEmail();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votação</h1>
          <p className="mt-2 text-gray-500">Digite seu email cadastrado para acessar o sistema de votação</p>
        </div>
        <div onKeyPress={handleKeyPress}>
          <EmailInput email={userEmail} onChange={setUserEmail} />
        </div>
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