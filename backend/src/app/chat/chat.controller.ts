import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "./utils/llm-model.js";
import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/api-response.js";
import fs from 'node:fs/promises';

export const resumeText = async () => {
    try {
        const loader = new PDFLoader('./public/temp/resume.pdf', { splitPages: true });
        const docs = await loader.load();
        await fs.unlink('./public/temp/resume.pdf');
        return docs[0]?.pageContent || "";
    } catch (error) {
        console.warn("Could not load resume.pdf. Error:", (error as Error).message);
        return "";
    }
};

// ── Mutable session state ─────────────────────────────────────────────────────
let currentRole: string = "Software Developer";
let messageHistory = new ChatMessageHistory();

// ── Build and inject the system prompt ───────────────────────────────────────
async function buildSystemPrompt(role: string): Promise<string> {
    const resumeContent = await resumeText();
    return `You are an experienced technical interview conductor evaluating candidates for a ${role} position.

CANDIDATE'S RESUME:
${resumeContent}

Your responsibilities:
1. Conduct a professional and thorough technical interview.
2. Ask relevant questions based on the ${role} role requirements.
3. Evaluate the candidate's experience using their resume as context.
4. Assess their technical skills, problem-solving approach, and communication.
5. Provide constructive feedback based on their responses.
6. Keep the interview focused and professional.
7. Ask follow-up questions to deepen understanding of their experience.

Guidelines:
- Start with a brief introduction and outline the interview structure.
- Ask 2-3 core technical questions relevant to the ${role} position.
- Keep the interview to around 10-15 minutes.
- Reference specific experience from their resume when asking questions.
- Maintain a friendly but professional tone.
- Be prepared to adjust difficulty based on their responses.`;
}

// ── Called by the upload controller after a new resume + role are received ────
export const reinitializeController = async (role: string) => {
    console.log(`🔄 Reinitializing interview session for role: "${role}"`);
    currentRole = role;
    messageHistory = new ChatMessageHistory();                 // fresh conversation
    const systemPrompt = await buildSystemPrompt(currentRole);
    await messageHistory.addMessage(new SystemMessage(systemPrompt));
};

// ── Chat handler ──────────────────────────────────────────────────────────────
const chating = async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    await messageHistory.addMessage(new HumanMessage(message));

    const response = await model.invoke(await messageHistory.getMessages());
    const fullMessage = response.content as string;
    await messageHistory.addAIMessage(fullMessage);

    ApiResponse.ok(res, "Message processed successfully", { message: fullMessage });
};

export { chating };
