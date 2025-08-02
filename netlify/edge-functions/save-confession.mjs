// netlify/edge-functions/save-confession.mjs

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { confession } = await request.json();

    // For now, just log the confession or simulate saving
    console.log("📝 Received confession:", confession);

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("❌ Error saving confession:", err);

    return new Response(JSON.stringify({ error: "Failed to save confession" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
