export async function sendConfession() {
  const input = document.getElementById("confession");
  const userText = input.value.trim();
  if (!userText) return;

  document.getElementById("user-confession").innerText = userText;
  document.getElementById("result").classList.remove("hidden");
  const aiOutput = document.getElementById("ai-response");
  aiOutput.innerText = "Thinking...";

  const headers = {
    "Content-Type": "application/json"
  };

  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    headers["X-Admin-Token"] = adminToken;
  }

  try {
    const res = await fetch("/.netlify/functions/ask-openai", {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: userText })
    });

    if (!res.body || !res.ok) {
      const data = await res.json();
      aiOutput.innerText = data.error || "Something went wrong.";
      return;
    }

    aiOutput.innerText = "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiOutput.innerText += decoder.decode(value, { stream: true });
    }
  } catch (err) {
    console.error(err);
    aiOutput.innerText = "Something went wrong. Try again.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("confess-btn");
  if (btn) btn.addEventListener("click", sendConfession);
});