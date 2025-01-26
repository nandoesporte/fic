import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FICDailyMetric {
  id: string;
  date: string;
  average_index: number;
  created_at: string;
  updated_at: string;
}

interface DimensionPerformance {
  id: string;
  dimension: string;
  score: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useFICMetrics = () => {
  return useQuery({
    queryKey: ["fic-metrics"],
    queryFn: async () => {
      // Fetch daily metrics
      const { data: dailyMetrics, error: dailyError } = await supabase
        .from("fic_daily_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30) as { data: FICDailyMetric[] | null; error: any };

      if (dailyError) {
        console.error("Error fetching daily metrics:", dailyError);
        throw dailyError;
      }

      // Fetch dimension performance
      const { data: dimensionMetrics, error: dimensionError } = await supabase
        .from("dimension_performance")
        .select("*")
        .order("date", { ascending: false })
        .limit(30) as { data: DimensionPerformance[] | null; error: any };

      if (dimensionError) {
        console.error("Error fetching dimension metrics:", dimensionError);
        throw dimensionError;
      }

      return {
        dailyMetrics: dailyMetrics || [],
        dimensionMetrics: dimensionMetrics || []
      };
    },
  });
};