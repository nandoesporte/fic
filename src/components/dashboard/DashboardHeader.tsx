import { Sparkles, Clock, Calendar, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  temperature: number;
  condition: string;
  city: string;
}

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        console.log('Fetching weather data...');
        
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log('Got user location:', latitude, longitude);
              await getWeatherData(latitude, longitude);
            },
            async (error) => {
              console.log('Geolocation error, using default location:', error);
              // Fallback to default location (São Paulo)
              await getWeatherData();
            }
          );
        } else {
          console.log('Geolocation not supported, using default location');
          // Fallback to default location
          await getWeatherData();
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setIsLoadingWeather(false);
      }
    };

    const getWeatherData = async (lat?: number, lon?: number) => {
      try {
        console.log('Calling weather function with:', { lat, lon });
        
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { lat, lon }
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        console.log('Weather data received:', data);
        setWeather(data);
      } catch (error) {
        console.error('Weather API error:', error);
        // Set fallback weather data so the display still shows something
        setWeather({
          temperature: 24,
          condition: 'informação não disponível',
          city: 'São Paulo'
        });
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();

    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
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

          {weather && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white/50">
              <div className="flex items-center gap-2 text-blue-700">
                <Cloud className="h-4 w-4" />
                <span className="text-sm font-medium">Clima</span>
              </div>
              <div className="text-lg font-bold text-gray-900 mt-1">
                {weather.temperature}°C
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {weather.condition}
              </div>
              <div className="text-xs text-gray-500">
                {weather.city}
              </div>
            </div>
          )}

          {isLoadingWeather && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white/50">
              <div className="flex items-center gap-2 text-blue-700">
                <Cloud className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Clima</span>
              </div>
              <div className="text-lg font-bold text-gray-500 mt-1">
                Carregando...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};