import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Premium Statistics E2E', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create premium user
        const signupResponse = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'stats@test.com',
                password: 'Test123!',
                name: 'Stats Test User',
            });

        authToken = signupResponse.body.token;

        // Subscribe to premium
        await request(app.getHttpServer())
            .post('/premium/subscribe')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                plan: 'INDIVIDUAL_PREMIUM',
                paymentMethod: 'stripe',
            });

        await request(app.getHttpServer())
            .post('/premium/verify-payment')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                transactionId: 'test_stats_tx',
                paymentMethod: 'stripe',
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Profile Statistics', () => {
        it('should get profile stats', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.stats).toBeDefined();
            expect(response.body.stats).toHaveProperty('profileViews');
            expect(response.body.stats).toHaveProperty('searchAppearances');
            expect(response.body.stats).toHaveProperty('growth');
        });

        it('should track profile views', async () => {
            const beforeResponse = await request(app.getHttpServer())
                .get('/stats/profile')
                .set('Authorization', `Bearer ${authToken}`);

            const beforeViews = beforeResponse.body.stats.profileViews.total;

            // Log profile view
            await request(app.getHttpServer())
                .post('/stats/profile/view')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const afterResponse = await request(app.getHttpServer())
                .get('/stats/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(afterResponse.body.stats.profileViews.total).toBe(beforeViews + 1);
        });

        it('should get recent viewers', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/profile/viewers')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.viewers).toBeDefined();
            expect(Array.isArray(response.body.viewers)).toBe(true);
        });

        it('should get profile ranking', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/profile/ranking')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.ranking).toBeDefined();
            expect(response.body.ranking).toHaveProperty('position');
            expect(response.body.ranking).toHaveProperty('percentile');
        });
    });

    describe('Recruitment Dashboard', () => {
        let companyToken: string;

        beforeAll(async () => {
            // Create company user
            const companySignup = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'company@test.com',
                    password: 'Test123!',
                    name: 'Test Company',
                    type: 'company',
                });

            companyToken = companySignup.body.token;

            // Subscribe to company plan
            await request(app.getHttpServer())
                .post('/premium/subscribe')
                .set('Authorization', `Bearer ${companyToken}`)
                .send({
                    plan: 'COMPANY_STANDARD',
                    paymentMethod: 'stripe',
                });

            await request(app.getHttpServer())
                .post('/premium/verify-payment')
                .set('Authorization', `Bearer ${companyToken}`)
                .send({
                    transactionId: 'test_company_tx',
                    paymentMethod: 'stripe',
                });
        });

        it('should get recruitment stats', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/recruitment')
                .set('Authorization', `Bearer ${companyToken}`)
                .expect(200);

            expect(response.body.stats).toBeDefined();
            expect(response.body.stats).toHaveProperty('totalJobs');
            expect(response.body.stats).toHaveProperty('totalApplications');
            expect(response.body.stats).toHaveProperty('conversionRate');
        });

        it('should get application funnel', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/recruitment/funnel')
                .set('Authorization', `Bearer ${companyToken}`)
                .expect(200);

            expect(response.body.funnel).toBeDefined();
            expect(response.body.funnel).toHaveProperty('views');
            expect(response.body.funnel).toHaveProperty('applications');
            expect(response.body.funnel).toHaveProperty('interviews');
        });

        it('should get time-to-hire metrics', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/recruitment/time-to-hire')
                .set('Authorization', `Bearer ${companyToken}`)
                .expect(200);

            expect(response.body.metrics).toBeDefined();
            expect(response.body.metrics).toHaveProperty('average');
            expect(response.body.metrics).toHaveProperty('median');
        });
    });

    describe('Academy Dashboard', () => {
        let schoolToken: string;

        beforeAll(async () => {
            // Create school user
            const schoolSignup = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'school@test.com',
                    password: 'Test123!',
                    name: 'Test School',
                    type: 'school',
                });

            schoolToken = schoolSignup.body.token;

            // Subscribe to school plan
            await request(app.getHttpServer())
                .post('/premium/subscribe')
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    plan: 'SCHOOL_EDU',
                    paymentMethod: 'stripe',
                });

            await request(app.getHttpServer())
                .post('/premium/verify-payment')
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    transactionId: 'test_school_tx',
                    paymentMethod: 'stripe',
                });
        });

        it('should get academy stats', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/academy')
                .set('Authorization', `Bearer ${schoolToken}`)
                .expect(200);

            expect(response.body.stats).toBeDefined();
            expect(response.body.stats).toHaveProperty('totalStudents');
            expect(response.body.stats).toHaveProperty('totalCourses');
            expect(response.body.stats).toHaveProperty('completionRate');
        });

        it('should get student progress', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/academy/progress')
                .set('Authorization', `Bearer ${schoolToken}`)
                .expect(200);

            expect(response.body.progress).toBeDefined();
            expect(Array.isArray(response.body.progress)).toBe(true);
        });

        it('should get activity heatmap', async () => {
            const response = await request(app.getHttpServer())
                .get('/stats/academy/heatmap')
                .set('Authorization', `Bearer ${schoolToken}`)
                .expect(200);

            expect(response.body.heatmap).toBeDefined();
            expect(Array.isArray(response.body.heatmap)).toBe(true);
        });
    });
});
