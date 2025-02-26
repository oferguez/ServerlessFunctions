import OpenAI from "openai";
import { PassThrough } from "stream";

const headers = {
    "Access-Control-Allow-Origin": "*",  // Allow all origins (or specify your frontend URL)
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

export async function handler(event) {
    console.log("FETCHER: Function triggered");

    // 🛑 Handle Preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        console.log("FETCHER: Handling OPTIONS request");
        return {
            statusCode: 204,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: "",
        };
    }

    try {
        const { words, targetLanguage } = JSON.parse(event.body);

        const prompt = `
        You are a multilingual linguistics expert and wordplay specialist. Your task is to generate multiple-choice options for a vocabulary learning game.
    
        Given:
        - A list of words: ${JSON.stringify(words)}
        - Source Language: you need to detect source languange from the words
        - Target Language: ${targetLanguage}
    
        For each word w_i:
        1. **correct_i** → The **exact translation** of w_i into the target language. When target language equals source language, provide the best synonym you can find.
        2. **related_i** → A **random unrelated and incorrect translation**, meaning is NOT the correct translation. 
        3. **other_i1** and **other_i2** → Two **funny words** in the target language that are completely **unrelated** to w_i.
    
        Return the output as a structured list of objects in JSON format:
        \`\`\`json
        [
        {   
            "question": "w_1",
            "correct": "exact_translation_1",
            "related": "related_but_incorrect_1",
            "other1": "funny_unrelated_word_1",
            "other2": "funny_unrelated_word_2"
        },
        {
            "question": "w_2",
            "correct": "exact_translation_2",
            "related": "related_but_incorrect_2",
            "other1": "funny_unrelated_word_3",
            "other2": "funny_unrelated_word_4"
        }
        ]
        \`\`\`
        Ensure the **unrelated words** are humorous but still understandable in the target language. Return **only** the JSON output without any additional text.
        Every word should be unique and not repeated in the output.
        Every word should have its first letter capitalized.
        `;
    

        if (!words || words.length === 0) {
            console.error("FETCHER: Empty words list");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Words list cannot be empty." }),
            };
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            stream: true, // 🛑 Streaming enabled
        });

        const passThrough = new PassThrough();
        let responseData = ''; // Added to collect stream data

        // Process stream and forward chunks to PassThrough
        (async () => {
            try {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    responseData += content; // Collect stream data
                    passThrough.write(content); // Handle OpenAI stream chunks
                    console.log(`FETCHER: Stream chunk of size ${content.length} received`);
                }
                passThrough.end(); // Close stream
            } catch (streamError) {
                console.error("FETCHER: Error during stream processing", streamError);
                passThrough.end(); // Ensure stream is closed on error
            }
        })();

        // Wait for the stream to end and collect the data
        await new Promise((resolve, reject) => {
            passThrough.on('end', resolve);
            passThrough.on('error', reject); // Handle stream errors
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: responseData, // Return collected response data as string
        }

    } catch (error) {
        console.error("FETCHER: Error processing request", error);
        
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                error: "Internal server error", 
                details: error.message, 
                errorObj: JSON.stringify(error)}),
        };
    }
}