import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Premium Subscriptions E2E', () => {
    let app: INestApplication;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create test user and get auth token
        const signupResponse = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'test@premium.com',
                password: 'Test123!',
                name: 'Premium Test User',
            });

        authToken = signupResponse.body.token;
        userId = signupResponse.body.user.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Subscription Purchase Flow', () => {
        it('should get available plans', async () => {
            const response = await request(app.getHttpServer())
                .get('/premium/plans')
                .expect(200);

            expect(response.body.plans).toBeDefined();
            expect(response.body.plans.length).toBeGreaterThan(0);
            expect(response.body.plans[0]).toHaveProperty('name');
            expect(response.body.plans[0]).toHaveProperty('price');
            expect(response.body.plans[0]).toHaveProperty('features');
        });

        it('should purchase INDIVIDUAL_PREMIUM subscription', async () => {
            const response = await request(app.getHttpServer())
                .post('/premium/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plan: 'INDIVIDUAL_PREMIUM',
                    paymentMethod: 'stripe',
                    paymentToken: 'tok_test_visa',
                    amount: 9900,
                    currency: 'XOF',
                })
                .expect(201);

            expect(response.body.subscription).toBeDefined();
            expect(response.body.subscription.plan).toBe('INDIVIDUAL_PREMIUM');
            expect(response.body.subscription.status).toBe('pending');
        });

        it('should verify and activate subscription', async () => {
            // Simulate payment verification
            const response = await request(app.getHttpServer())
                .post('/premium/verify-payment')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    transactionId: 'test_transaction_123',
                    paymentMethod: 'stripe',
                })
                .expect(200);

            expect(response.body.subscription.status).toBe('active');
            expect(response.body.subscription.active).toBe(true);
        });

        it('should get active subscription', async () => {
            const response = await request(app.getHttpServer())
                .get('/premium/subscription')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.subscription).toBeDefined();
            expect(response.body.subscription.plan).toBe('INDIVIDUAL_PREMIUM');
            expect(response.body.subscription.active).toBe(true);
        });

        it('should prevent duplicate active subscription', async () => {
            await request(app.getHttpServer())
                .post('/premium/subscribe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plan: 'INDIVIDUAL_PLUS',
                    paymentMethod: 'stripe',
                })
                .expect(400);
        });
    });

    describe('Quota Management', () => {
        it('should initialize quotas on subscription', async () => {
            const response = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.quotas).toBeDefined();
            expect(response.body.quotas.PROFILE_BOOST).toBeDefined();
            expect(response.body.quotas.PROFILE_BOOST.total).toBeGreaterThan(0);
            expect(response.body.quotas.PROFILE_BOOST.remaining).toBeGreaterThan(0);
        });

        it('should increment quota usage', async () => {
            const beforeResponse = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`);

            const beforeRemaining = beforeResponse.body.quotas.PROFILE_BOOST.remaining;

            // Use a quota
            await request(app.getHttpServer())
                .post('/premium/use-quota')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quotaType: 'PROFILE_BOOST' })
                .expect(200);

            const afterResponse = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`);

            const afterRemaining = afterResponse.body.quotas.PROFILE_BOOST.remaining;

            expect(afterRemaining).toBe(beforeRemaining - 1);
        });

        it('should prevent quota usage when exceeded', async () => {
            // Exhaust quota
            const quotaResponse = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`);

            const remaining = quotaResponse.body.quotas.PROFILE_BOOST.remaining;

            // Use all remaining quotas
            for (let i = 0; i < remaining; i++) {
                await request(app.getHttpServer())
                    .post('/premium/use-quota')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ quotaType: 'PROFILE_BOOST' });
            }

            // Try to use one more
            await request(app.getHttpServer())
                .post('/premium/use-quota')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quotaType: 'PROFILE_BOOST' })
                .expect(403);
        });

        it('should reset quotas monthly', async () => {
            const response = await request(app.getHttpServer())
                .post('/premium/reset-quotas')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.quotas.PROFILE_BOOST.used).toBe(0);
            expect(response.body.quotas.PROFILE_BOOST.remaining).toBe(
                response.body.quotas.PROFILE_BOOST.total,
            );
        });
    });

    describe('Subscription Cancellation', () => {
        it('should cancel subscription', async () => {
            const response = await request(app.getHttpServer())
                .post('/premium/cancel')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.subscription.status).toBe('cancelled');
            expect(response.body.subscription.active).toBe(false);
        });

        it('should prevent premium features after cancellation', async () => {
            await request(app.getHttpServer())
                .post('/premium/use-quota')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quotaType: 'PROFILE_BOOST' })
                .expect(403);
        });
    });
});
