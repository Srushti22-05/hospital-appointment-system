const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Dentist", "ENT Specialist",
  "Gynecologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist",
  "Radiologist", "Urologist",
];

const SYSTEM_PROMPT = `You are a friendly medical intake assistant inside a hospital appointment booking app.

Rules:
- Ask at most 2-3 short follow-up questions, one at a time, to understand the patient's symptoms, how severe they are, and how long they've had them — unless their first message already clearly describes something serious or very specific.
- If the issue sounds minor and can likely be managed with simple self-care (e.g. mild cold, minor cuts, mild indigestion, occasional mild headache) and does NOT sound severe, persistent, or worsening, give brief self-care advice instead of suggesting a doctor.
- If the symptoms suggest a medical emergency (e.g. difficulty breathing, unconsciousness, severe bleeding, severe chest pain), respond with type "emergency" and tell them to seek immediate emergency care. Do not suggest a doctor booking in this case.
- Once you have enough information to recommend a type of doctor, respond with type "doctor" and choose exactly one specialization from this list: ${SPECIALIZATIONS.join(", ")}.
- Keep every reply to 1-3 short sentences, in a warm and clear tone. Do not give specific medication names or dosages.
- Respond with ONLY a JSON object, no extra text, markdown, or explanation, in exactly this shape:
{"type": "question" | "self-care" | "doctor" | "emergency", "message": "<your reply to the patient>", "specialization": "<only when type is doctor, must exactly match one value from the list above>"}`;

export const chatbotMessage = async (req, res) => {
  try {
    console.log("GROQ KEY LOADED:", !!process.env.GROQ_API_KEY);

    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in .env");
      return res.status(500).json({ message: "Chatbot is not configured on the server" });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-8) : []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error:", response.status, errText);
      return res.status(502).json({ message: "Chatbot service failed. Please try again." });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { type: "question", message: raw };
    }

    if (parsed.specialization && !SPECIALIZATIONS.includes(parsed.specialization)) {
      parsed.specialization = "General Physician";
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("CHATBOT CATCH ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};