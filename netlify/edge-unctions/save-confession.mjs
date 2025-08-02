export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const confession = body.confession;

    if (!confession || !confession.text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing confession text" })
      };
    }

    // You can log here to test it's working:
    console.log("Confession received:", confession);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Confession saved" })
    };
  } catch (err) {
    console.error("Function crashed:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
}
