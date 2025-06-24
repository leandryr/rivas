// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("🔴 OPENAI_API_KEY no está definida en .env.local o en Vercel");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Debes enviar un { message: string } válido." },
        { status: 400 }
      );
    }

    // Llamada a gpt-3.5-turbo, el modelo "más económico".
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres el asistente virtual de RivasDev. Atiendes preguntas sobre nuestros servicios freelance globales: cómo crear un proyecto, planes y precios, facturación, etc. Responde con pasos claros y concisos. Si no sabes algo, responde "Lo siento, no puedo ayudarte con eso en este momento."`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Error en /api/chat:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un problema al llamar a OpenAI." },
      { status: 500 }
    );
  }
}
