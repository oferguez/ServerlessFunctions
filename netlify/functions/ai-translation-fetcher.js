import OpenAI from "openai";

const  headers = {
    "Access-Control-Allow-Origin": "*",  // Allow all origins (or specify a domain instead of `*`)
    "Access-Control-Allow-Methods": " POST",
    "Access-Control-Allow-Headers": "Content-Type"
};

export async function handler(event) {
    const { words, targetLanguage } = JSON.parse(event.body);
    
    if (!words || words.length === 0) {
        return { headers: headers, statusCode: 400, body: JSON.stringify({ error: "Words list cannot be empty." }) };
    }

    const hasKey = !!process.env.OPENAI_KEY;
    if (!hasKey) {
        return {  headers: headers, statusCode: 400, body: JSON.stringify({ error: "No OpenAPI Key" }) };
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY // ✅ Secure API Key
    });

    const prompt = `
    You are a multilingual linguistics expert and wordplay specialist. Your task is to generate multiple-choice options for a vocabulary learning game.

    Given:
    - A list of words: ${JSON.stringify(words)}
    - Source Language: you need to detect source languange from the words
    - Target Language: ${targetLanguage}

    For each word w_i:
    1. **correct_i** → The **exact translation** of w_i into the target language. When target language equals source language, provide the best synonym you can find.
    2. **related_i** → A **related but incorrect translation**, meaning it is connected to w_i but is NOT the correct translation.
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
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 2500,
            temperature: 0.7,
        });

        const textResponse = response.choices[0].message.content.trim();
        const jsonMatch = textResponse.match(/\[.*\]/s);

        if (!jsonMatch) {
            throw new Error("Failed to extract JSON from OpenAI response.");
        }

        return {
            headers: headers, 
            statusCode: 200,
            body: JSON.stringify(JSON.parse(jsonMatch[0])),
        };
    } catch (error) {
        console.error("Error fetching translations:", error);
        return {
            headers: headers, 
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}