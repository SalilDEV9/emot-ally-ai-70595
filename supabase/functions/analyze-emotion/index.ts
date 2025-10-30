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
      analysisPrompt = `Analyze the facial expression in this image. Detect the primary emotion (happy, sad, anxious, calm, angry, neutral) and provide:
1. The detected emotion
2. Confidence level (0-100%)
3. Brief empathetic observation (2-3 sentences)
4. A gentle supportive suggestion

Format as JSON:
{
  "emotion": "emotion_name",
  "confidence": 85,
  "observation": "your observation",
  "suggestion": "your suggestion"
}`;

      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: analysisPrompt },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    } else if (type === 'voice' && audio) {
      analysisPrompt = `Analyze the emotional tone from this voice transcription: "${audio}". Detect the primary emotion and provide empathetic feedback.

Format as JSON:
{
  "emotion": "emotion_name",
  "confidence": 85,
  "observation": "your observation",
  "suggestion": "your suggestion"
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
