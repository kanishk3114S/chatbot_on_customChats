import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import "dotenv/config";
import path from "node:path";
import { chat } from "./chaat.js";

if (!process.env.GEMINI_API_KEY) {
    console.error("\n❌ Error: GEMINI_API_KEY is missing! Please check your .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const history = []; // Initially an empty array

async function chattingFn(ques) {
    // Add user's message to history
    history.push({
        role: "user",
        parts: [{ text: ques }]
    });

    try {
        // Send complete conversation history to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: history,
            config: {
                systemInstruction: chat.text
            }
        });

        // Add Gemini's response to history
        history.push({
            role: "model",
            parts: [{ text: response.text }]
        });

        // Display Gemini's response
        console.log("\nGemini:", response.text);
    } catch (error) {
        // Pop the user message from history if the call failed
        history.pop();
        console.error("\n❌ Gemini Error:", error.message || error);
    }
}

async function main() {
    console.log("=== Chatbot started! (Type 'exit' to quit) ===");

    while (true) {
        const question = readlineSync.question("\nStart the chat -----> ");

        if (question.trim().toLowerCase() === "exit") {
            console.log("\nBye! Have a nice day.\n");
            break;
        }

        if (!question.trim()) {
            continue;
        }

        await chattingFn(question);
    }
}

main();