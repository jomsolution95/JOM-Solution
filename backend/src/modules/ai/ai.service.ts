import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateSummaryDto } from './dto/generate-summary.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { User } from '../users/schemas/user.schema';
import { Job } from '../jobs/schemas/job.schema';
import { Application } from '../jobs/schemas/application.schema';
import { Types } from 'mongoose';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private modelName = 'gemini-pro';

    constructor(
        private configService: ConfigService,
        @InjectModel(ChatMessage.name) private chatModel: Model<ChatMessageDocument>,
        @InjectModel(User.name) private userModel: Model<any>,
        @InjectModel(Job.name) private jobModel: Model<any>,
        @InjectModel(Application.name) private applicationModel: Model<any>,
    ) {
        // Use provided key as fallback or env var 'GEMINI_API_KEY'
        const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'AIzaSyA9gXHlH58fMwe-6z7MnbdyEkAaDcFGRAk';
        console.log("AI Service Init - API Key present:", !!this.configService.get<string>('GEMINI_API_KEY'), "Using Key:", apiKey.substring(0, 8) + "...");
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async generateSummary(dto: GenerateSummaryDto): Promise<{ summary: string }> {
        // Fallback check first
        if (!this.genAI) {
            console.log("AI Service: No GenAI instance, returning mock.");
            return { summary: this.generateMockSummary(dto) };
        }

        try {
            console.log("AI Service: Generating summary via Gemini...");
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = `Génère un résumé professionnel, concis et accrocheur (3-4 phrases) pour un profil CV.
            Rôle: ${dto.currentRole || 'Professionnel'}
            Expérience: ${dto.experiences?.length || 0} postes
            Compétences clés: ${dto.skills?.map(s => s.name).join(', ') || 'N/A'}.
            Ton: Professionnel et orienté résultats. Parle à la première personne (Je).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("Empty response from AI");

            return { summary: text.trim() };
        } catch (error) {
            console.error('Gemini Error (generating summary):', error);
            // Always return mock on failure
            return { summary: this.generateMockSummary(dto) };
        }
    }

    async analyzeCv(dto: any): Promise<{ score: number; missingKeywords: string[]; improvements: string[] }> {
        if (!this.genAI) {
            return this.mockAnalyzeCv(dto);
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName, generationConfig: { responseMimeType: "application/json" } });

            const prompt = `Analyse ce CV pour le poste: "${dto.jobTitle}".
            
            CV Data: ${JSON.stringify(dto.cvContent).slice(0, 4000)}

            Tâche:
            1. Score ATS (0-100).
            2. Mots-clés manquants (max 5).
            3. Améliorations (max 3).
            
            Réponds UNIQUEMENT en JSON format:
            { "score": number, "missingKeywords": ["str"], "improvements": ["str"] }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Cleanup Markdown if present (```json ... ```)
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(text);

        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            return this.mockAnalyzeCv(dto);
        }
    }

    private generateMockSummary(dto: GenerateSummaryDto): string {
        const role = dto.currentRole || 'Professionnel';
        const skills = dto.skills?.map(s => s.name).slice(0, 3).join(', ') || 'compétences variées';
        const experienceCount = dto.experiences?.length || 0;
        const templates = [
            `${role} passionné(e) avec une expertise solide en ${skills}. Fort de ${experienceCount} expériences significatives, je suis orienté résultats.`,
            `Profil ${role} expérimenté, maîtrisant ${skills}. ${experienceCount} postes à mon actif, je suis prêt pour de nouveaux défis.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    private mockAnalyzeCv(dto: any): { score: number; missingKeywords: string[]; improvements: string[] } {
        const jobTitle = dto.jobTitle || 'General';
        const currentSkills = dto.skills || [];
        let targetKeywords = ['Communication', 'Anglais'];
        if (jobTitle.toLowerCase().includes('dev')) targetKeywords = ['React', 'Node.js', 'Git'];

        const missingKeywords = targetKeywords.filter(k =>
            !currentSkills.some((s: string) => s.toLowerCase().includes(k.toLowerCase()))
        );
        let score = 60 + Math.round(((targetKeywords.length - missingKeywords.length) / targetKeywords.length) * 40);

        return {
            score: score > 100 ? 100 : score,
            missingKeywords,
            improvements: ["Ajoutez davantage de mots-clés techniques.", "Quantifiez vos résultats."]
        };
    }
    // --- ADMIN COPILOT ---

    /**
     * Handles Admin queries using Tool Calls.
     * 1. Asks AI to select a tool (get_stats, search_user).
     * 2. Executes the tool (mocked or real).
     * 3. Feeds result back to AI for natural language response.
     * @param question The admin's natural language question.
     * @param context Optional context.
     * @returns The AI answer + Metadata about the tool used.
     */
    async adminChat(question: string, context: any = {}): Promise<{ answer: string; toolUsed?: string, toolResult?: any }> {
        if (!this.genAI) {
            return { answer: "Je suis en mode simulation (Pas de clé API). Je ne peux pas interroger la base de données réelle." };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });

            // 1. Tool Selection Step
            // We explain capabilities to the AI and ask if it needs data
            const toolPrompt = `
            You are an Admin Assistant for JOM Academy.
            User Question: "${question}"
            
            Available Tools:
            - get_global_stats: Returns total users, jobs, courses. Use for "stats", "overview", "chiffres".
            - search_user: Returns dummy user data. Use for "find user", "search".
            - none: If the question is general or greeting.

            Response JSON format ONLY: { "tool": "get_global_stats" | "search_user" | "none", "params": {} }
            `;

            const toolResult = await model.generateContent(toolPrompt);
            let toolJsonString = toolResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            let toolData = { tool: 'none', params: {} };

            try {
                toolData = JSON.parse(toolJsonString);
            } catch (e) {
                console.error("AI Tool Parse Error", e);
            }

            // 2. Execute Tool (REAL DATA)
            let data = null;
            if (toolData.tool === 'get_global_stats') {
                const [users, activeJobs, applications] = await Promise.all([
                    this.userModel.countDocuments(),
                    this.jobModel.countDocuments({ status: 'active' }),
                    this.applicationModel.countDocuments()
                ]);
                data = { users, active_jobs: activeJobs, applications, revenue_mtd: "(Not implemented)" };
            } else if (toolData.tool === 'search_user') {
                // Simplified search for demo
                const user = await this.userModel.findOne().sort({ createdAt: -1 }).select('email role').lean();
                data = user ? { ...user, note: "Latest user found" } : { error: "No user found" };
            }

            // 3. Generate Final Answer
            const finalPrompt = `
            Context: You are talking to a Super Admin.
            User Question: "${question}"
            Tool Used: ${toolData.tool}
            Data Retrieved: ${JSON.stringify(data)}

            Task: Answer the user's question naturally based on the Data Retrieved. If no data, answer generally.
            Keep it professional and concise.
            `;

            const finalResult = await model.generateContent(finalPrompt);
            return {
                answer: finalResult.response.text(),
                toolUsed: toolData.tool !== 'none' ? toolData.tool : undefined,
                toolResult: data
            };

        } catch (error) {
            console.error('Admin Chat Error:', error);
            return {
                answer: "Désolé, une erreur est survenue lors du traitement de votre demande."
            };
        }
    }

    // --- POST-AUDIT: USER CONCIERGE ---

    /**
     * Handles User Chat with Persistent History.
     * Fetches the last 10 messages from MongoDB to provide context to Gemini.
     * @param userId The ID of the authenticated user.
     * @param userMessage The new message from the user.
     * @returns The AI's response string.
     */
    /**
     * Handles User Chat with Persistent History.
     * Fetches the last 10 messages from MongoDB to provide context to Gemini.
     */
    async chatWithHistory(userId: string, userMessage: string): Promise<string> {
        if (!this.genAI) {
            return "Je suis en mode simulation (Pas de clé API). Je ne peux pas interroger la base de données réelle.";
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });

            // 1. Fetch History
            const history = await this.chatModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            // Reverse to chronological order for the AI
            const chatHistory = history.reverse().map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // 2. Start Chat Session with Context
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{
                            text: `
                                System Prompt: You are the AI Assistant for JOM Academy.
                                Your Goal: Help the user with any question about the platform.
                                - If they ask about Jobs, explain we have a Job Board.
                                - If they ask about learning, explain our Academy/Courses.
                                - Be helpful, polite, and concise.
                                - Always answer in the language the user speaks (French/English).
                            `}]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am ready to help the JOM Academy user." }]
                    },
                    ...chatHistory as any[]
                ]
            });

            // 3. Send Message
            const result = await chat.sendMessage(userMessage);
            const responseText = result.response.text();

            // 4. Save History
            await this.chatModel.create([
                { userId, role: 'user', content: userMessage },
                { userId, role: 'assistant', content: responseText }
            ]);

            return responseText;

        } catch (error: any) {
            console.error('Chat History Error:', error);
            console.log("Switching to Mock Chat due to API error.");
            return this.mockChat(userMessage);
        }
    }

    private mockChat(message: string): string {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
            return "Bonjour ! Je suis l'assistant JOM (Mode Simulation). Comment puis-je vous aider ?";
        }
        if (lowerMsg.includes('emploi') || lowerMsg.includes('recrutement')) {
            return "Nous avons plusieurs offres d'emploi disponibles dans la section 'Opportunités'. Souhaitez-vous que je vous montre les dernières offres ?";
        }
        if (lowerMsg.includes('formation') || lowerMsg.includes('cours')) {
            return "Notre académie propose des formations certifiantes. Vous pouvez les consulter dans l'onglet 'Académie'.";
        }
        return "Je suis en mode simulation car la clé API rencontre un problème. Je ne peux pas générer de réponse complexe pour le moment, mais je comprends que vous parlez de : " + message;
    }

    async getHistory(userId: string) {
        return this.chatModel.find({ userId }).sort({ createdAt: 1 }).limit(50);
    }
}
