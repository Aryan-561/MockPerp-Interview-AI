import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "./utils/llm-model.js";
import type { Request, Response } from "express";
import {ApiResponse} from "../../common/utils/api-response.js";


export const resumeText = async () => {

    const loader = new PDFLoader('./public/resume.pdf', {splitPages:true});
    const docs = await loader.load();
    // console.log(docs[0]?.pageContent);
    return docs[0]?.pageContent || "";
}

const role = 'frontend developer';

const messageHistory = new ChatMessageHistory();

let resumeContent: string = "";
let systemPrompt: string = "";

async function initializeController() {
    resumeContent = await resumeText();
    systemPrompt = `You are an experienced technical interview conductor evaluating candidates for a ${role} position.

CANDIDATE'S RESUME:
${resumeContent}

Your responsibilities:
1. Conduct a professional and thorough technical interview
2. Ask relevant questions based on the ${role} role requirements
3. Evaluate the candidate's experience using their resume as context
4. Assess their technical skills, problem-solving approach, and communication
5. Provide constructive feedback based on their responses
6. Keep the interview focused and professional
7. Ask follow-up questions to deepend understanding of their experience

Guidelines:
- Start with an introduction and outline the interview structure
- Ask 2-3 core technical questions relevant to the ${role} position
- Take interview around 10-15 minutes
- Reference specific experience from their resume when asking questions
- Evaluate how well they explain their experience and approach
- Maintain a friendly but professional tone
- Be prepared to adjust difficulty based on their responses`;

    messageHistory.addMessage(new SystemMessage(systemPrompt));
}

initializeController();

const chating = async (req: Request, res: Response) => {
    
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }


    // Generate system prompt with resume and role
    

    messageHistory.addMessage(new HumanMessage(message));

    // Get all messages and prepend system prompt
    

    const response = await model.invoke(await messageHistory.getMessages());
    const fullMessage = response.content as string;
    await messageHistory.addAIMessage(fullMessage);

    ApiResponse.ok(res, "Message processed successfully", { message: fullMessage });
}



export { chating };