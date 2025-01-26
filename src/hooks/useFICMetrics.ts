import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFICMetrics = () => {
  return useQuery({
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