import { OpenAI } from "openai";
import fetch from "node-fetch";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

const UPSTASH_URL = process.env.UPSTASH_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REST_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const headers = event.headers;
  const ip = headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const isAdmin = headers["x-admin-token"] === ADMIN_TOKEN;

  let prompt;
  try {
    const body = JSON.parse(event.body || "{}");
    prompt = body.prompt?.trim();
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" })
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing prompt" })
    };
  }

  // Rate limiting for non-admins
  if (!isAdmin) {
    const rateRes = await fetch(`${UPSTASH_URL}/set/${ip}?EX=86400&NX=1`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });

    const rateData = await rateRes.json();
    if (!rateData.result) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: "Limit reached. Try again tomorrow."
        })
      };
    }
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You're a kind listener. If a message is serious, respond with empathy. If it's a joke, gently nudge them to try again with something real."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: completion.choices[0].message.content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Something went wrong"
      })
    };
  }
}
