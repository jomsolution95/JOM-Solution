import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Boosts E2E', () => {
    let app: INestApplication;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create test user with premium subscription
        const signupResponse = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'boost@test.com',
                password: 'Test123!',
                name: 'Boost Test User',
            });

        authToken = signupResponse.body.token;
        userId = signupResponse.body.user.id;

        // Subscribe to premium
        await request(app.getHttpServer())
            .post('/premium/subscribe')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                plan: 'INDIVIDUAL_PREMIUM',
                paymentMethod: 'stripe',
                paymentToken: 'tok_test',
            });

        // Activate subscription
        await request(app.getHttpServer())
            .post('/premium/verify-payment')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                transactionId: 'test_boost_tx',
                paymentMethod: 'stripe',
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Profile Boost', () => {
        let boostId: string;

        it('should create profile boost', async () => {
            const response = await request(app.getHttpServer())
                .post('/boosts/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    duration: 7,
                })
                .expect(201);

            expect(response.body.boost).toBeDefined();
            expect(response.body.boost.type).toBe('profile');
            expect(response.body.boost.active).toBe(true);
            expect(response.body.boost.duration).toBe(7);

            boostId = response.body.boost._id;
        });

        it('should get active boosts', async () => {
            const response = await request(app.getHttpServer())
                .get('/boosts/active')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.boosts).toBeDefined();
            expect(response.body.boosts.length).toBeGreaterThan(0);
            expect(response.body.boosts[0].type).toBe('profile');
        });

        it('should increment boost views', async () => {
            const beforeResponse = await request(app.getHttpServer())
                .get(`/boosts/${boostId}`)
                .set('Authorization', `Bearer ${authToken}`);

            const beforeViews = beforeResponse.body.boost.views;

            // Log view
            await request(app.getHttpServer())
                .post(`/boosts/${boostId}/view`)
                .expect(200);

            const afterResponse = await request(app.getHttpServer())
                .get(`/boosts/${boostId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(afterResponse.body.boost.views).toBe(beforeViews + 1);
        });

        it('should get boost analytics', async () => {
            const response = await request(app.getHttpServer())
                .get(`/boosts/${boostId}/analytics`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.analytics).toBeDefined();
            expect(response.body.analytics.views).toBeGreaterThan(0);
            expect(response.body.analytics.impressions).toBeDefined();
        });

        it('should prevent duplicate active profile boost', async () => {
            await request(app.getHttpServer())
                .post('/boosts/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ duration: 7 })
                .expect(400);
        });

        it('should deactivate boost', async () => {
            const response = await request(app.getHttpServer())
                .post(`/boosts/${boostId}/deactivate`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.boost.active).toBe(false);
        });
    });

    describe('Job Boost', () => {
        let jobId: string;
        let jobBoostId: string;

        beforeAll(async () => {
            // Create a job first
            const jobResponse = await request(app.getHttpServer())
                .post('/jobs')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Job',
                    description: 'Test Description',
                    location: 'Dakar',
                });

            jobId = jobResponse.body.job._id;
        });

        it('should create job boost', async () => {
            const response = await request(app.getHttpServer())
                .post('/boosts/job')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    jobId,
                    duration: 7,
                })
                .expect(201);

            expect(response.body.boost).toBeDefined();
            expect(response.body.boost.type).toBe('job');
            expect(response.body.boost.jobId).toBe(jobId);

            jobBoostId = response.body.boost._id;
        });

        it('should mark job as featured', async () => {
            const response = await request(app.getHttpServer())
                .get(`/jobs/${jobId}`)
                .expect(200);

            expect(response.body.job.featured).toBe(true);
            expect(response.body.job.boosted).toBe(true);
        });

        it('should prioritize boosted jobs in listings', async () => {
            const response = await request(app.getHttpServer())
                .get('/jobs')
                .expect(200);

            const boostedJob = response.body.jobs.find((j: any) => j._id === jobId);
            const firstJob = response.body.jobs[0];

            // Boosted job should be in top results
            expect(boostedJob).toBeDefined();
            expect(response.body.jobs.indexOf(boostedJob)).toBeLessThan(5);
        });
    });

    describe('Quota Consumption', () => {
        it('should consume quota on boost creation', async () => {
            const beforeResponse = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`);

            const beforeRemaining = beforeResponse.body.quotas.PROFILE_BOOST.remaining;

            // Deactivate previous boost
            const boostsResponse = await request(app.getHttpServer())
                .get('/boosts/active')
                .set('Authorization', `Bearer ${authToken}`);

            for (const boost of boostsResponse.body.boosts) {
                await request(app.getHttpServer())
                    .post(`/boosts/${boost._id}/deactivate`)
                    .set('Authorization', `Bearer ${authToken}`);
            }

            // Create new boost
            await request(app.getHttpServer())
                .post('/boosts/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ duration: 7 });

            const afterResponse = await request(app.getHttpServer())
                .get('/premium/quotas')
                .set('Authorization', `Bearer ${authToken}`);

            expect(afterResponse.body.quotas.PROFILE_BOOST.remaining).toBe(
                beforeRemaining - 1,
            );
        });
    });
});
