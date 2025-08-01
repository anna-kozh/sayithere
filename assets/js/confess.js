async function sendConfession() {
  const input = document.getElementById("confession");
  const userText = input.value.trim();
  if (!userText) return;

  document.getElementById("user-confession").innerText = userText;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("ai-response").innerText = "Thinking...";

  try {
    const res = await fetch("/.netlify/functions/ask-openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userText })
    });

    const data = await res.json();
    document.getElementById("ai-response").innerText =
      data.response || data.error || "No response";
  } catch (err) {
    console.error(err);
    document.getElementById("ai-response").innerText =
      "Something went wrong. Try again.";
  }
}
