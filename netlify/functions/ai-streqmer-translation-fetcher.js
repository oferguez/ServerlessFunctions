import OpenAI from "openai";

export async function handler(event) {
    console.log('FETCHER: fetch_tr_called');
    
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*" } };
    }

    const { words, targetLanguage } = JSON.parse(event.body);

    if (!words || words.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: "Words list cannot be empty." }) };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

    const prompt = `You are a multilingual linguistics expert...`;

    try {
        console.log('FETCHER: calling OpenAI with streaming...');
        
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 2000,
            temperature: 0.7,
            stream: true // 🛑 ENABLE STREAMING
        });

        // 🛑 Stream response to client
        return new Response(stream, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        console.error("FETCHER: Error streaming OpenAI response:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Internal server error", OpenAiError: error }),
        };
    }
}