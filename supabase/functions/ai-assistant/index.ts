import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_RESPONSES: Record<string, string> = {
  default: `I'm Wanderly AI, your personal travel guide! I can help you:
- Discover amazing destinations around the world
- Plan day-by-day itineraries tailored to your interests
- Find the best local restaurants and hidden foodie gems
- Recommend accommodations from budget hostels to luxury resorts
- Estimate travel budgets and suggest money-saving tips

Where would you like to explore today? Tell me a destination and I'll create a personalized guide for you!`,

  paris: `Paris is one of the world's most iconic cities! Here's a quick overview:

**Top Attractions:**
- Eiffel Tower — iconic iron lattice tower, best at sunset
- Louvre Museum — world's largest art museum, home to the Mona Lisa
- Notre-Dame Cathedral — Gothic masterpiece (reopened 2024!)
- Montmartre — charming hilltop district with Sacré-Cœur basilica
- Musée d'Orsay — Impressionist art in a stunning former railway station

**Best Neighborhoods:**
- Le Marais — trendy boutiques, Jewish Quarter, Place des Vosges
- Saint-Germain-des-Prés — literary cafes, galleries, elegant streets
- Bastille — vibrant nightlife and local Parisian feel

**Food Highlights:**
- Café de Flore for classic French brasserie experience
- Pierre Hermé for world-class macarons
- Marché d'Aligre for fresh produce and antiques

**Budget Estimate:** €150-250/day (mid-range)
**Best Time to Visit:** April-June, September-October`,

  tokyo: `Tokyo is a thrilling blend of ancient tradition and cutting-edge modernity!

**Must-Visit Neighborhoods:**
- Shibuya — famous crossing, shopping, youth culture
- Shinjuku — neon-lit entertainment district, Golden Gai bars
- Asakusa — senso-ji temple, traditional crafts, rickshaws
- Harajuku — Takeshita Street, Meiji Shrine, Omotesando boutiques
- Akihabara — electronics, anime, gaming culture

**Top Experiences:**
- TeamLab digital art museums
- Tsukiji Outer Market for the freshest sushi breakfast
- Sumo morning practice viewing (seasonal)
- Day trip to Mt. Fuji from Shinjuku
- Robot Restaurant in Shinjuku (kitschy but unforgettable!)

**Food Scene:**
Tokyo has more Michelin stars than any other city. Try:
- Ramen: Ichiran for solo dining experience
- Sushi: Tsukiji Market or omakase restaurants
- Yakitori: under the train tracks in Yurakucho

**Budget Estimate:** ¥10,000-20,000/day (mid-range, ~$70-140 USD)`,

  bali: `Bali is Indonesia's spiritual and cultural heartland — a paradise for all travelers!

**Top Destinations in Bali:**
- Ubud — arts center, rice terraces, monkey forest, yoga retreats
- Seminyak — upscale beach clubs, sunset cocktails, fine dining
- Canggu — surfing, digital nomad cafes, bohemian nightlife
- Uluwatu — dramatic clifftop temple, legendary surf breaks
- Nusa Penida — crystal-clear waters, Kelingking Beach, snorkeling

**Cultural Experiences:**
- Tanah Lot temple at sunset
- Kecak fire dance performance at Uluwatu
- Traditional cooking class in Ubud
- Rice terrace walk through Tegallalang
- Visit a traditional Balinese ceremony

**Wellness & Adventure:**
- Sunrise hike up Mount Batur (active volcano!)
- White water rafting on Ayung River
- Yoga retreats and spa treatments
- Snorkeling at Menjangan Island

**Budget Estimate:** $50-150/day (varies hugely by area)
**Best Time:** April-October (dry season)`,
};

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("paris") || lower.includes("france")) return DEMO_RESPONSES.paris;
  if (lower.includes("tokyo") || lower.includes("japan")) return DEMO_RESPONSES.tokyo;
  if (lower.includes("bali") || lower.includes("indonesia")) return DEMO_RESPONSES.bali;
  return DEMO_RESPONSES.default;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, destination } = await req.json();
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      const lastUserMsg = messages?.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
      const context = destination ? `${destination} ${lastUserMsg}` : lastUserMsg;
      const demoResponse = getDemoResponse(context);
      return new Response(
        JSON.stringify({ content: demoResponse, demo: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Wanderly AI, an expert travel assistant. You help travelers discover destinations, plan itineraries, find restaurants and accommodation, and get practical travel advice.

When recommending places, structure your responses with:
- Clear headings using **bold text**
- Bullet points for lists
- Estimated costs when relevant
- Practical tips and insider knowledge

Current destination context: ${destination || "global"}

Always be enthusiastic, knowledgeable, and specific. Avoid vague generic advice. Focus on authentic local experiences.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in OpenAI response");

    return new Response(
      JSON.stringify({ content, demo: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error, content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", demo: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
