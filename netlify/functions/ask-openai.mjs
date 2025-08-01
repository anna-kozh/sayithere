import { SYSTEM_PROMPT } from "./tone.js";

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

  // 🧾 Log request timestamp
  const timestamp = new Date().toISOString();
  await fetch(`${UPSTASH_URL}/lpush/log:${ip}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([timestamp])
  });

  // Keep only the 10 most recent logs
  await fetch(`${UPSTASH_URL}/ltrim/log:${ip}/0/9`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
  });

  // 📋 Get and validate prompt
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

  // ⛔ Rate limiting for non-admins
  if (!isAdmin) {
    const getRes = await fetch(`${UPSTASH_URL}/get/${ip}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });

    const getData = await getRes.json();
    const count = parseInt(getData.result) || 0;

    if (count >= 2) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: "Limit reached. Try again tomorrow."
        })
      };
    }

    // Increase count
    await fetch(`${UPSTASH_URL}/incrby/${ip}/1`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });

    // Reset after 24 hours
    await fetch(`${UPSTASH_URL}/expire/${ip}/86400`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
  }

  // 🤖 Generate AI response
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
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
