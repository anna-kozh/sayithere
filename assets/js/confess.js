async function sendConfession() {
  const input = document.getElementById("confession");
  const userText = input.value.trim();
  if (!userText) return;

  const outputEl = document.getElementById("ai-response");
  document.getElementById("user-confession").innerText = userText;
  document.getElementById("result").classList.remove("hidden");
  outputEl.innerText = "";

  try {
    const res = await fetch(`${window.location.origin}/ask-openai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userText })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });

      for (const char of chunk) {
        outputEl.innerText += char;
        await new Promise((r) => setTimeout(r, 10)); // mimic typing
      }
    }
  } catch (err) {
    console.error("💥 Failed to reach Edge Function:", err);
    outputEl.innerText = "Something went wrong.";
  }
}
