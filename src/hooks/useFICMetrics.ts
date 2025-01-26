import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type FICDailyMetric = Database['public']['Tables']['fic_daily_metrics']['Row'];
type DimensionPerformance = Database['public']['Tables']['dimension_performance']['Row'];

interface FICMetricsData {
  dailyMetrics: FICDailyMetric[];
  dimensionMetrics: DimensionPerformance[];
}

export const useFICMetrics = () => {
  return useQuery<FICMetricsData>({
    queryKey: ["fic-metrics"],
    queryFn: async () => {
      // Fetch daily metrics
      const { data: dailyMetrics, error: dailyError } = await supabase
        .from("fic_daily_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

      if (dailyError) {
        console.error("Error fetching daily metrics:", dailyError);
        throw dailyError;
      }

      // Fetch dimension performance
      const { data: dimensionMetrics, error: dimensionError } = await supabase
        .from("dimension_performance")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

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