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
    const { lat, lon, city } = await req.json()
    
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY')
    if (!apiKey) {
      throw new Error('Google Cloud API key not configured')
    }

    let latitude = lat || -23.5505
    let longitude = lon || -46.6333
    let cityName = city || 'São Paulo'

    // If city name is provided, geocode it to get coordinates
    if (city && city !== 'São Paulo') {
      console.log('Geocoding city:', city)
      
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}&language=pt-BR`
      
      const geocodeResponse = await fetch(geocodeUrl)
      const geocodeData = await geocodeResponse.json()

      if (geocodeResponse.ok && geocodeData.status === 'OK' && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location
        latitude = location.lat
        longitude = location.lng
        
        // Extract formatted city name
        const addressComponents = geocodeData.results[0].address_components
        const cityComponent = addressComponents.find((component: any) => 
          component.types.includes('locality') || 
          component.types.includes('administrative_area_level_2')
        )
        if (cityComponent) {
          cityName = cityComponent.long_name
        }
        
        console.log(`Geocoded ${city} to:`, { latitude, longitude, cityName })
      } else {
        console.log('Geocoding failed, using coordinates for city name')
      }
    }

    // For demo purposes with Google API, we'll simulate weather data
    // You can integrate with any weather service you prefer
    const simulatedWeatherData: WeatherData = {
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      condition: ['céu claro', 'parcialmente nublado', 'ensolarado', 'nuvens dispersas'][Math.floor(Math.random() * 4)],
      city: cityName
    }

    console.log(`Weather data retrieved for ${cityName}: ${simulatedWeatherData.temperature}°C, ${simulatedWeatherData.condition}`)

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