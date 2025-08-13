import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface VotingToastConfig {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-600" />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-l-4 border-l-green-500 bg-green-50 text-green-900';
    case 'error':
      return 'border-l-4 border-l-red-500 bg-red-50 text-red-900';
    case 'warning':
      return 'border-l-4 border-l-yellow-500 bg-yellow-50 text-yellow-900';
    case 'info':
      return 'border-l-4 border-l-blue-500 bg-blue-50 text-blue-900';
  }
};

export const showVotingToast = ({ type, title, description, duration = 4000 }: VotingToastConfig) => {
  const CustomToast = () => (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg ${getToastStyles(type)} animate-fade-in hover-scale`}>
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold mb-1">{title}</h4>
        {description && (
          <p className="text-xs opacity-90 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );

  toast(<CustomToast />, {
    duration,
    position: 'top-right',
  });
};

// Predefined toast functions for common voting actions
export const votingToasts = {
  success: (message: string, description?: string) => 
    showVotingToast({ type: 'success', title: message, description }),
    
  error: (message: string, description?: string) => 
    showVotingToast({ type: 'error', title: message, description }),
    
  warning: (message: string, description?: string) => 
    showVotingToast({ type: 'warning', title: message, description }),
    
  info: (message: string, description?: string) => 
    showVotingToast({ type: 'info', title: message, description }),

  // Specific voting actions
  maxSelectionsReached: (sectionName: string) => 
    showVotingToast({
      type: 'warning',
      title: 'Limite de seleções atingido',
      description: `Você já selecionou o máximo de 3 opções em ${sectionName}. Para selecionar outra opção, desmarque uma das selecionadas.`
    }),

  voteRegistered: () =>
    showVotingToast({
      type: 'success',
      title: 'Voto registrado!',
      description: 'Sua seleção foi registrada com sucesso.'
    }),

  votesSubmitted: () =>
    showVotingToast({
      type: 'success',
      title: 'Votos enviados com sucesso!',
      description: 'Todos os seus votos foram registrados e enviados.',
      duration: 5000
    }),

  emailVerified: () =>
    showVotingToast({
      type: 'success',
      title: 'Email verificado!',
      description: 'Você pode agora participar da votação.'
    }),

  emailNotFound: () =>
    showVotingToast({
      type: 'error',
      title: 'Email não encontrado',
      description: 'O email informado não está registrado no sistema. Verifique se o email está correto.'
    }),

  alreadyVoted: (dimension: string) =>
    showVotingToast({
      type: 'info',
      title: 'Você já votou nesta dimensão',
      description: `Você já registrou seus votos para a dimensão "${dimension}".`
    }),

  incompleteVotes: () =>
    showVotingToast({
      type: 'warning',
      title: 'Votação incompleta',
      description: 'Por favor, selecione exatamente 3 opções em cada seção antes de confirmar seus votos.'
    })
};