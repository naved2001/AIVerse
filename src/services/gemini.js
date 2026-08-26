const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const MODEL = "gemini-3.6-flash";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      const base64 = result.split(",")[1];

      resolve({
        mimeType: file.type,
        data: base64,
      });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image."));
    };

    reader.readAsDataURL(file);
  });
}

export async function generateResponse(
  message,
  conversationHistory = [],
  onChunk,
  signal,
  image = null
) {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const recentHistory =
    conversationHistory.slice(-20);

  const history = recentHistory.map((item) => ({
    role:
      item.role === "assistant"
        ? "model"
        : "user",

    parts: [
      {
        text: item.content,
      },
    ],
  }));

  let imagePart = null;

  if (image) {
    imagePart = { inlineData: await fileToBase64(image), };
  }

  const userParts = [
    {
      text: message,
    },
  ];

  if (imagePart) {
    userParts.push(imagePart);
  }

  const contents = [
    ...history,
    {
      role: "user",
      parts: userParts,
    },
  ];

  const response = await fetch(
    `${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse&key=${API_KEY}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents,
      }),

      signal,
    }
  );

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => null);

    throw new Error(
      errorData?.error?.message ||
      `Gemini API request failed: ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported by this response."
    );
  }

  const reader =
    response.body.getReader();

  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split("\n");

    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) continue;

      if (!trimmedLine.startsWith("data:")) {
        continue;
      }

      const jsonString =
        trimmedLine.replace(/^data:\s*/, "");

      if (jsonString === "[DONE]") {
        continue;
      }

      try {
        const data =
          JSON.parse(jsonString);

        const text =
          data?.candidates?.[0]?.content
            ?.parts?.[0]?.text;

        if (text && onChunk) {
          onChunk(text);
        }
      } catch (error) {
        console.warn(
          "Could not parse Gemini stream chunk:",
          error
        );
      }
    }
  }
}