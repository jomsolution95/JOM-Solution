import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OrangeMoneyService {
    private apiKey: string;
    private apiUrl: string;
    private merchantKey: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('ORANGE_MONEY_API_KEY') || '';
        this.merchantKey = this.configService.get<string>('ORANGE_MONEY_MERCHANT_KEY') || '';
        this.apiUrl =
            this.configService.get<string>('ORANGE_MONEY_API_URL') ||
            'https://api.orange.com/orange-money-webpay/dev/v1';
    }

    /**
     * Get OAuth token
     */
    private async getAccessToken(): Promise<string> {
        try {
            const response = await axios.post(
                `${this.apiUrl}/oauth/token`,
                {
                    grant_type: 'client_credentials',
                },
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.merchantKey}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            return response.data.access_token;
        } catch (error: any) {
            throw new BadRequestException(`Failed to get Orange Money token: ${error.message}`);
        }
    }

    /**
     * Initiate Orange Money payment
     */
    async initiatePayment(
        amount: number,
        currency: string = 'XOF',
        phoneNumber: string,
        metadata?: Record<string, any>,
    ): Promise<{ transactionId: string; paymentUrl: string }> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                `${this.apiUrl}/webpayment`,
                {
                    merchant_key: this.merchantKey,
                    currency: currency,
                    order_id: `ORDER_${Date.now()}`,
                    amount: amount,
                    return_url: metadata?.returnUrl || `${this.configService.get('APP_URL')}/premium/callback`,
                    cancel_url: metadata?.cancelUrl || `${this.configService.get('APP_URL')}/premium/cancel`,
                    notif_url: metadata?.notifUrl || `${this.configService.get('APP_URL')}/api/premium/webhook/orange`,
                    lang: 'fr',
                    reference: metadata?.reference || `SUB_${Date.now()}`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return {
                transactionId: response.data.payment_token,
                paymentUrl: response.data.payment_url,
            };
        } catch (error: any) {
            throw new BadRequestException(`Orange Money payment initiation failed: ${error.message}`);
        }
    }

    /**
     * Verify Orange Money payment status
     */
    async verifyPayment(transactionId: string): Promise<boolean> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                `${this.apiUrl}/webpayment/${transactionId}/status`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            return response.data.status === 'SUCCESS';
        } catch (error: any) {
            throw new BadRequestException(
                `Orange Money payment verification failed: ${error.message}`,
            );
        }
    }

    /**
     * Get transaction details
     */
    async getTransaction(transactionId: string): Promise<any> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                `${this.apiUrl}/webpayment/${transactionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            return response.data;
        } catch (error: any) {
            throw new BadRequestException(`Failed to get transaction: ${error.message}`);
        }
    }
}
