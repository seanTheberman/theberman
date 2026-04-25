import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(() => new Response(JSON.stringify({ error: "gone" }), { status: 410, headers: { "Content-Type": "application/json" } }));
