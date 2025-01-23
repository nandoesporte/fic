import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmailInput } from "@/components/EmailInput";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";

interface EmailVerificationProps {
  session: Session | null;
  onVerified: (email: string) => void;
}

export const EmailVerification = ({ session, onVerified }: EmailVerificationProps) => {
  const [userEmail, setUserEmail] = useState("");

  const verifyEmail = async () => {
    if (!userEmail) {
      toast.error('Por favor, insira seu email');
      return;
    }

    if (!session?.user) {
      toast.error('Você precisa estar autenticado para votar');
      return;
    }

    try {
      const { data: voterData, error: voterError } = await supabase
        .from('registered_voters')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();

      if (voterError) {
        console.error('Erro ao verificar email:', voterError);
        toast.error('Erro ao verificar email');
        return;
      }

      if (!voterData) {
        toast.error('Email não encontrado no sistema. Por favor, verifique se digitou corretamente.');
        return;
      }

      if (session.user.email !== userEmail) {
        toast.error('O email informado não corresponde ao usuário autenticado');
        return;
      }

      onVerified(userEmail);
      toast.success('Email verificado com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      toast.error('Erro ao verificar email. Por favor, tente novamente.');
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
        >
          Acessar Sistema de Votação
        </Button>
      </div>
    </div>
  );
};