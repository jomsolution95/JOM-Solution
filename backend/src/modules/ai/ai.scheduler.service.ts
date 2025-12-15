
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from './ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';

@Injectable()
export class AiSchedulerService {
    private readonly logger = new Logger(AiSchedulerService.name);
    // Hardcoded Admin ID for demo. ideally fetch from Config or DB (First Admin)
    private readonly ADMIN_ID = '675d9e50e932c02096707328';

    constructor(
        private readonly aiService: AiService,
        @InjectModel(ChatMessage.name) private chatModel: Model<ChatMessageDocument>
    ) { }

    // Run every day at 8:00 AM
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleDailyReport() {
        this.logger.log('Starting Daily AI Report generation...');

        // 1. Collect Data (Mocked for now)
        const stats = {
            newUsers: Math.floor(Math.random() * 10),
            newJobs: Math.floor(Math.random() * 5),
            revenue: Math.floor(Math.random() * 50000),
            serverStatus: 'Stable'
        };

        // 2. Ask Gemini to write the report
        const prompt = `
        Context: You are the Proactive Admin Assistant.
        Task: Write a Morning Briefing for the Super Admin.
        Data: 
        - New Users Yesterday: ${stats.newUsers}
        - New Jobs: ${stats.newJobs}
        - Revenue: ${stats.revenue} FCFA
        - System Status: ${stats.serverStatus}

        Format: Professional, concise, nice emoji usage. Start with "Bonjour Admin ! Voici le rapport d'hier ☀️".
        `;

        try {
            // We use a "bypass" to just generate text without specific user context history
            // We can reuse a simple generation method or create a new one. 
            // Leveraging generateSummary logic or just direct call.
            // For now, let's assume we add a helper 'generateText' in AiService or use 'adminChat' conceptually.
            // Let's call the raw model via AiService if exposed, or just use adminChat with a trick.

            const report = await this.aiService.adminChat(prompt); // Reusing adminChat as a generic generation tool

            // 3. Push to Chat
            await this.chatModel.create({
                userId: this.ADMIN_ID,
                role: 'assistant',
                content: report.answer,
                metadata: { type: 'daily_report' }
            });

            this.logger.log('Daily Report sent to Admin Chat.');
        } catch (e) {
            this.logger.error('Failed to generate daily report', e);
        }
    }

    // Run every hour to check security
    @Cron(CronExpression.EVERY_HOUR)
    async handleSecurityCheck() {
        // Mock Security Check
        const failedLoginCount = Math.random() > 0.9 ? 50 : 2; // 10% chance of alert

        if (failedLoginCount > 20) {
            this.logger.warn('Security Alert Triggered!');
            const alertMsg = `⚠️ **ALERTE SÉCURITÉ** : J'ai détecté ${failedLoginCount} tentatives de connexion échouées dans la dernière heure. Veuillez vérifier les logs d'accès immédiatement.`;

            await this.chatModel.create({
                userId: this.ADMIN_ID,
                role: 'assistant',
                content: alertMsg,
                metadata: { type: 'security_alert', severity: 'high' }
            });
        }
    }
}
