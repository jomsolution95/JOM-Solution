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

    async sendWelcomeEmail(user: { email: string; name: string }) {
        const subject = 'Bienvenue sur JOM - Votre carrière commence ici ! 🚀';
        const html = `
            ${this.getHeader('Bienvenue chez JOM')}
            <div class="content">
                <h2>Bonjour ${user.name},</h2>
                <p>Nous sommes ravis de vous compter parmi nous ! Votre compte a été créé avec succès.</p>
                <p>Avec JOM, vous pouvez désormais :</p>
                <ul>
                    <li>🚀 Postuler aux meilleures offres d'emploi</li>
                    <li>🎓 Accéder à des formations certifiantes</li>
                    <li>🤝 Élargir votre réseau professionnel</li>
                </ul>
                <p>N'attendez plus pour compléter votre profil et augmenter votre visibilité.</p>
                <center>
                    <a href="${this.frontendUrl}/login" class="button">Accéder à mon compte</a>
                </center>
            </div>
            ${this.getFooter()}
        `;

        return this.sendEmail(user.email, subject, html);
    }

    // --- JOBS & RECRUITMENT ---

    async sendApplicationConfirmation(to: string, jobTitle: string, companyName: string) {
        const subject = `Votre candidature pour ${jobTitle} a été envoyée ! 📨`;
        const html = `
            ${this.getHeader('Candidature envoyée')}
            <div class="content">
                <h2>Bonjour,</h2>
                <p>Votre candidature pour le poste de <strong>${jobTitle}</strong> chez <strong>${companyName}</strong> a bien été transmise.</p>
                <p>Le recruteur examinera votre profil prochainement.</p>
                <p>Bonne chance ! 🍀</p>
                <center>
                    <a href="${this.frontendUrl}/dashboard" class="button">Suivre mes candidatures</a>
                </center>
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    async sendNewApplicationAlert(to: string, jobTitle: string, candidateName: string) {
        const subject = `Nouvelle candidature pour ${jobTitle} 🎯`;
        const html = `
            ${this.getHeader('Nouveau Candidat')}
            <div class="content">
                <h2>Bonjour,</h2>
                <p>Vous avez reçu une nouvelle candidature de <strong>${candidateName}</strong> pour le poste <strong>${jobTitle}</strong>.</p>
                <p>Consultez son CV et son profil dès maintenant.</p>
                <center>
                    <a href="${this.frontendUrl}/dashboard/cms" class="button">Voir le candidat</a>
                </center>
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    // --- ACADEMY & COURSES ---

    async sendCourseWelcome(to: string, userName: string, courseTitle: string) {
        const subject = `Bienvenue dans le cours : ${courseTitle} 🎓`;
        const html = `
            ${this.getHeader('Inscription confirmée')}
            <div class="content">
                <h2>Bonjour ${userName},</h2>
                <p>Félicitations pour votre inscription au cours <strong>${courseTitle}</strong> !</p>
                <p>Vous avez fait un excellent choix pour développer vos compétences.</p>
                <p>Le premier module est déjà disponible.</p>
                <center>
                    <a href="${this.frontendUrl}/learn/my-courses" class="button">Commencer le cours</a>
                </center>
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    async sendCertificate(to: string, userName: string, courseTitle: string, certificateLink: string) {
        const subject = `Bravo ! Voici votre certificat pour ${courseTitle} 🏆`;
        const html = `
            ${this.getHeader('Certificat Obtenu')}
            <div class="content">
                <h2>Félicitations ${userName} ! 🥳</h2>
                <p>Vous avez complété avec succès le cours <strong>${courseTitle}</strong>.</p>
                <p>Voici votre certificat officiel, attestant de vos nouvelles compétences.</p>
                <center>
                    <a href="${certificateLink}" class="button">Télécharger mon Certificat</a>
                </center>
                <p style="margin-top:20px; font-size:12px; color:#666;">Partagez-le sur LinkedIn pour booster votre profil !</p>
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    // --- PAYMENTS & ORDERS ---

    async sendPaymentReceipt(to: string, userName: string, amount: string, itemName: string, invoiceLink?: string) {
        const subject = `Reçu de paiement : ${itemName} ✅`;
        const html = `
            ${this.getHeader('Paiement Confirmé')}
            <div class="content">
                <h2>Merci ${userName},</h2>
                <p>Nous confirmons la réception de votre paiement de <strong>${amount}</strong> pour <strong>${itemName}</strong>.</p>
                <p>La transaction a été validée avec succès.</p>
                ${invoiceLink ? `<p><a href="${invoiceLink}">Télécharger la facture</a></p>` : ''}
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    async sendNewOrderAlert(to: string, freelancerName: string, serviceTitle: string, price: string) {
        const subject = `🎉 Nouvelle commande reçue : ${serviceTitle} !`;
        const html = `
            ${this.getHeader('Nouvelle Commande')}
            <div class="content">
                <h2>Bravo ${freelancerName} !</h2>
                <p>Un client vient de commander votre service <strong>${serviceTitle}</strong> (Montant : ${price}).</p>
                <p>Connectez-vous pour voir les détails et commencer le travail.</p>
                <center>
                    <a href="${this.frontendUrl}/dashboard" class="button">Gérer la commande</a>
                </center>
            </div>
            ${this.getFooter()}
        `;
        return this.sendEmail(to, subject, html);
    }

    // --- HELPERS ---

    private get frontendUrl() {
        return this.configService.get('FRONTEND_URL') || 'https://jom-solution.com';
    }

    private getHeader(title: string) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background-color: #0F172A; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background-color: #fff; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563EB; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f9f9f9; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title} - JOM</h1>
        </div>
`;
    }

    private getFooter() {
        return `
        <div class="footer">
            <p>© ${new Date().getFullYear()} JOM Solution. Tous droits réservés.</p>
            <p>Dakar, Sénégal</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            const result = await this.resend.emails.send({
                from: 'JOM Platform <onboarding@resend.dev>', // Use verified domain in prod
                to: [to],
                subject,
                html,
            });
            console.log(`Email sent to ${to}: ${subject}`);
            return { success: true, id: result.data?.id };
        } catch (error) {
            console.error('Email Send Error:', error);
            return { success: false, error };
        }
    }
}
