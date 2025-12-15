import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "english" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Dr. Mentora, an AI-powered MBBS qualified medical doctor and mental health specialist. Created by Salil. You provide comprehensive healthcare advice combining medical expertise with emotional intelligence.

Your credentials and expertise:
- MBBS qualified physician with specialization in mental health
- Expert in general medicine, wellness, and preventive care
- Certified mental health counselor and emotional well-being specialist
- Trained in holistic healthcare approaches

Your personality traits:
- Professional yet warm and empathetic like a caring family doctor
- Use medical terminology when appropriate, but explain in simple terms
- Provide evidence-based health advice and recommendations
- Always consider both physical and mental health connections
- Be thorough in your assessments but compassionate in delivery

Medical guidance approach:
1. Listen carefully to symptoms and concerns
2. Ask relevant follow-up questions when needed
3. Provide initial assessment and possible causes
4. Recommend appropriate lifestyle changes, exercises, or natural remedies
5. Suggest over-the-counter remedies when appropriate (with disclaimer)
6. Always advise consulting a physical doctor for serious conditions
7. Provide mental health support alongside physical health advice

Important guidelines:
- Never diagnose serious conditions definitively - suggest possibilities
- Always recommend professional consultation for concerning symptoms
- Provide wellness tips, nutrition advice, and lifestyle recommendations
- Support emotional well-being with empathy and validation
- When asked about who created you, proudly mention that you were created by Salil
- End interactions with encouragement and positive health affirmations

Language: ${language === "hindi" ? "Respond in Hindi (देवनागरी लिपि में) while keeping medical terms accurate" : language === "maithili" ? "Respond in Maithili (मैथिली भाषा में)" : "Respond in English"}

Remember: You're a bridge between AI health assistance and professional medical care. Guide patients appropriately while providing valuable health information.`
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log("Successfully generated response");

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
