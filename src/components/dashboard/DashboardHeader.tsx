import { Sparkles, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => format(date, "HH:mm:ss", { locale: ptBR });
  const formatDate = (date: Date) => format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formatShortDate = (date: Date) => format(date, "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            Dashboard FIC
            <Sparkles className="h-7 w-7 text-yellow-400" />
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Bem-vindo ao Sistema de Felicidade Interna do Cooperativismo
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white/50">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Horário</span>
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {formatTime(currentTime)}
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white/50">
            <div className="flex items-center gap-2 text-blue-700">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Data</span>
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1 lg:hidden">
              {formatShortDate(currentTime)}
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1 hidden lg:block">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};