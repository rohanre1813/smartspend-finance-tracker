import axios from "axios";

export const scanReceipt = async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: "No image provided" });
  }

  // ✅ Strip data URI prefix if frontend sends it (e.g. "data:image/jpeg;base64,...")
  const cleanBase64 = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  const resolvedMime = mimeType || "image/jpeg";

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in .env");
    return res.status(500).json({ message: "Server misconfiguration: missing API key" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: resolvedMime,
                  data: cleanBase64,
                },
              },
              {
                text: `Analyze this receipt image and extract the following information in JSON format only, no markdown, no extra text:
{
  "amount": <number, total amount paid>,
  "date": "<YYYY-MM-DD format>",
  "description": "<merchant name or brief description>",
  "category": "<one of: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Education, Rent, Travel, Groceries, Fuel, Other>",
  "type": "expense"
}
If you cannot determine a value, use null for that field.`,
              },
            ],
          },
        ],
      },
      {
        timeout: 20000, // 20s timeout
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw response:", text); // helpful for debugging

    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw text was:", text);
      return res.status(500).json({
        message: "Gemini returned non-JSON response",
        raw: text,
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI scan full error:", JSON.stringify(error?.response?.data, null, 2));
    console.error("AI scan message:", error.message);
    res.status(500).json({
      message: "Could not scan receipt",
      detail: error?.response?.data,
    });
  }
};