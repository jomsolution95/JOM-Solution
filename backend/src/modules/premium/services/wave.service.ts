import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WaveService {
    private apiKey: string;
    private apiUrl: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('WAVE_API_KEY') || '';
        this.apiUrl = this.configService.get<string>('WAVE_API_URL') || 'https://api.wave.com/v1';
    }

    /**
     * Initiate Wave payment
     */
    async initiatePayment(
        amount: number,
        currency: string = 'XOF',
        phoneNumber: string,
        metadata?: Record<string, any>,
    ): Promise<{ transactionId: string; checkoutUrl: string }> {
        try {
            const response = await axios.post(
                `${this.apiUrl}/checkout/sessions`,
                {
                    amount: amount,
                    currency: currency,
                    error_url: metadata?.errorUrl || `${this.configService.get('APP_URL')}/premium/error`,
                    success_url: metadata?.successUrl || `${this.configService.get('APP_URL')}/premium/success`,
                    phone_number: phoneNumber,
                    metadata: metadata || {},
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return {
                transactionId: response.data.id,
                checkoutUrl: response.data.wave_launch_url,
            };
        } catch (error: any) {
            throw new BadRequestException(`Wave payment initiation failed: ${error.message}`);
        }
    }

    /**
     * Verify Wave payment status
     */
    async verifyPayment(transactionId: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.apiUrl}/checkout/sessions/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });

            return response.data.payment_status === 'succeeded';
        } catch (error: any) {
            throw new BadRequestException(`Wave payment verification failed: ${error.message}`);
        }
    }

    /**
     * Get transaction details
     */
    async getTransaction(transactionId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.apiUrl}/checkout/sessions/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });

            return response.data;
        } catch (error: any) {
            throw new BadRequestException(`Failed to get transaction: ${error.message}`);
        }
    }
}
