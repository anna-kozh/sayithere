---
layout: default
title: Say it here
---

<h1 class="text-3xl font-bold text-pink-600 mb-4">Say it here</h1>

<p class="mb-4 font-medium">Whatever it is, if it's still sitting in your body — say it here.</p>

<textarea id="confession" rows="6" class="w-full border rounded p-2 mb-4" placeholder="What's on your mind?"></textarea>

<button onclick="sendConfession()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send my confession</button>

<div id="result" class="mt-6 hidden">
  <h2 class="font-bold mb-2">You said:</h2>
  <p id="user-confession" class="mb-4 whitespace-pre-wrap text-gray-700"></p>
  <h2 class="font-bold mb-2">Our reply...</h2>
  <p id="ai-response" class="whitespace-pre-wrap text-blue-700"></p>
</div>

<script>
  async function sendConfession() {
    const input = document.getElementById("confession");
    const userText = input.value.trim();
    if (!userText) return;

    document.getElementById("user-confession").innerText = userText;
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("ai-response").innerText = "Thinking...";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_OPENAI_API_KEY"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You're a kind listener. If a message is serious, respond with empathy. If it's a joke, gently nudge them to try again with something real."
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();
    if (data.choices) {
      document.getElementById("ai-response").innerText = data.choices[0].message.content;
    } else {
      document.getElementById("ai-response").innerText = "Something went wrong. Please try again.";
    }
  }
</script>
