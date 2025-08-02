async function sendConfession() {
  const input = document.getElementById("confession");
  const userText = input.value.trim();
  if (!userText) return;

  const outputEl = document.getElementById("ai-response");
  document.getElementById("user-confession").innerText = userText;
  document.getElementById("result").classList.remove("hidden");
  outputEl.innerText = "";

  const res = await fetch("/ask-openai", {
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
    outputEl.innerText += chunk;
  }
}
