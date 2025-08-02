import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { prompt } = await request.json();

  if (!prompt || !prompt.trim()) {
    return new Response(JSON.stringify({ error: "Missing prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [
      {
        role: "system",
        content: "You're a thoughtful, empathetic confidant. Respond gently and insightfully."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
