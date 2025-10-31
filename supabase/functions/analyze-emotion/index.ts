import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, audio, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let analysisPrompt = '';
    const messages: any[] = [];

    if (type === 'facial' && image) {
      analysisPrompt = `You are an expert emotion recognition AI. Analyze this facial expression image with extreme precision.

Detect the PRIMARY emotion from: happy, sad, anxious, calm, angry, neutral

Key indicators:
- HAPPY: Smile, raised cheeks, crinkled eyes, relaxed forehead
- SAD: Downturned mouth, drooping eyes, furrowed brow, tears
- ANXIOUS: Tense jaw, wide eyes, raised eyebrows, rigid expression  
- CALM: Relaxed features, soft eyes, neutral mouth, peaceful expression
- ANGRY: Furrowed brow, narrowed eyes, tense jaw, flared nostrils
- NEUTRAL: No strong expression, balanced features

Provide accurate analysis in JSON:
{
  "emotion": "exact_emotion_name",
  "confidence": 85,
  "observation": "specific details about what you see in their expression",
  "suggestion": "gentle supportive advice based on detected emotion"
}`;

      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: analysisPrompt },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else if (type === 'voice' && audio) {
      analysisPrompt = `You are an empathetic AI analyzing text for emotional content.

Analyze this message: "${audio}"

Detect the PRIMARY emotion from: happy, sad, anxious, calm, angry, neutral

Look for:
- Word choice (positive vs negative)
- Intensity of language
- Topics discussed
- Tone indicators

Format as JSON:
{
  "emotion": "exact_emotion_name",
  "confidence": 85,
  "observation": "what the text reveals about their emotional state",
  "suggestion": "supportive response based on emotion"
}`;

      messages.push({
        role: 'user',
        content: analysisPrompt
      });
    } else {
      throw new Error('Invalid analysis type or missing data');
    }

    console.log('Sending emotion analysis request...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    console.log('Analysis result:', content);

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      // Fallback if JSON parsing fails
      analysis = {
        emotion: 'calm',
        confidence: 70,
        observation: content,
        suggestion: 'Take a moment to breathe and reflect on how you\'re feeling.'
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-emotion:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
