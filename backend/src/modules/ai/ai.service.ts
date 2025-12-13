import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateSummaryDto } from './dto/generate-summary.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private modelName = 'gemini-1.5-flash';

    constructor(private configService: ConfigService) {
        // Use provided key as fallback or env var 'GEMINI_API_KEY'
        const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'AIzaSyA9gXHlH58fMwe-6z7MnbdyEkAaDcFGRAk';
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async generateSummary(dto: GenerateSummaryDto): Promise<{ summary: string }> {
        if (!this.genAI) {
            return { summary: this.generateMockSummary(dto) };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = `Génère un résumé professionnel, concis et accrocheur (3-4 phrases) pour un profil CV.
            Rôle: ${dto.currentRole || 'Professionnel'}
            Expérience: ${dto.experiences?.length || 0} postes
            Compétences clés: ${dto.skills?.map(s => s.name).join(', ') || 'N/A'}.
            Ton: Professionnel et orienté résultats. Parle à la première personne (Je).`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return { summary: response.text().trim() };
        } catch (error) {
            console.error('Gemini Error:', error);
            // Fallback
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
            const text = response.text();

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
}
