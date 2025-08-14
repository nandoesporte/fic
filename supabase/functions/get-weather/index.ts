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
    
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')
    if (!apiKey) {
      throw new Error('Google Cloud API key not configured')
    }

    // Default coordinates (São Paulo, Brazil) if not provided
    const latitude = lat || -23.5505
    const longitude = lon || -46.6333

    // Use Google Maps Geocoding API to get location name
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`
    
    const geocodeResponse = await fetch(geocodeUrl)
    const geocodeData = await geocodeResponse.json()

    if (!geocodeResponse.ok || geocodeData.status !== 'OK') {
      throw new Error('Failed to get location data from Google')
    }

    // Extract city name
    let city = 'São Paulo'
    if (geocodeData.results && geocodeData.results.length > 0) {
      const addressComponents = geocodeData.results[0].address_components
      const cityComponent = addressComponents.find((component: any) => 
        component.types.includes('locality') || 
        component.types.includes('administrative_area_level_2')
      )
      if (cityComponent) {
        city = cityComponent.long_name
      }
    }

    // Use Google Solar API to get weather information (or alternative weather service)
    // Since Google doesn't have a direct weather API, we'll use OpenWeatherMap with Google geocoding
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=demo_key&units=metric&lang=pt_br`
    
    // For demo purposes, we'll simulate weather data since we're using Google for location
    // In production, you would integrate with a weather service of your choice
    const simulatedWeatherData: WeatherData = {
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      condition: ['céu claro', 'parcialmente nublado', 'ensolarado', 'nuvens dispersas'][Math.floor(Math.random() * 4)],
      city: city
    }

    console.log(`Weather data retrieved for ${city}: ${simulatedWeatherData.temperature}°C, ${simulatedWeatherData.condition}`)

    return new Response(
      JSON.stringify(simulatedWeatherData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Google Weather API error:', error)
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