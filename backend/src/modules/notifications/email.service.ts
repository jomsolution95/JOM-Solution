import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get('RESEND_API_KEY') || 're_BThXLJbi_DLF33uWCtKhgWUhde9aBiLk7';
        this.resend = new Resend(apiKey);
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            const result = await this.resend.emails.send({
                from: 'JOM Platform <onboarding@resend.dev>', // Use verified domain in prod
                to: [to], // Resend Dev only allows sending to the account email
                subject,
                html,
            });

            if (result.error) {
                console.error('Resend Error:', result.error);
                return { success: false, error: result.error };
            }

            return { success: true, id: result.data.id };
        } catch (error) {
            console.error('Email Send Error:', error);
            return { success: false, error };
        }
    }
}
