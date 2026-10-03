import "dotenv/config";

const res = await fetch("https://api.groq.com/openai/v1/models", {
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
});
const data = await res.json();
console.log(res.status);
console.log(data.data ? data.data.map((m) => m.id) : data);