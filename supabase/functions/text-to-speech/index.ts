import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Voice mapping for different languages
const languageVoiceMap: Record<string, string> = {
  english: 'nova',    // Clear, warm female voice - great for English
  hindi: 'shimmer',   // Expressive voice that works well with Hindi
  maithili: 'shimmer' // Same for Maithili (similar to Hindi)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice, language } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Select voice based on language or use provided voice
    const selectedVoice = voice || languageVoiceMap[language] || 'nova'

    console.log('Generating speech for text length:', text.length, 'language:', language, 'voice:', selectedVoice)

    // Generate speech from text using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI TTS error:', error)
      throw new Error(error.error?.message || 'Failed to generate speech')
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    console.log('Speech generated successfully, size:', base64Audio.length)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in text-to-speech:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
