import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherData {
  temperature: number;
  condition: string;
  city: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon } = await req.json()
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!apiKey) {
      throw new Error('API key not configured')
    }

    // Default coordinates (São Paulo, Brazil) if not provided
    const latitude = lat || -23.5505
    const longitude = lon || -46.6333

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`
    
    const response = await fetch(weatherUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data')
    }

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      city: data.name
    }

    return new Response(
      JSON.stringify(weatherData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Weather API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})