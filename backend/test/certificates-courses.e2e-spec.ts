import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Certificates & Courses E2E', () => {
    let app: INestApplication;
    let schoolToken: string;
    let studentToken: string;
    let courseId: string;
    let moduleId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create school user
        const schoolSignup = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'cert-school@test.com',
                password: 'Test123!',
                name: 'Certificate Test School',
                type: 'school',
            });

        schoolToken = schoolSignup.body.token;

        // Create student user
        const studentSignup = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: 'student@test.com',
                password: 'Test123!',
                name: 'Test Student',
            });

        studentToken = studentSignup.body.token;

        // Subscribe school to premium
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
                transactionId: 'test_cert_tx',
                paymentMethod: 'stripe',
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Course Management', () => {
        it('should create course', async () => {
            const response = await request(app.getHttpServer())
                .post('/academy/courses')
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    title: 'Test Course',
                    description: 'Test Description',
                    duration: 30,
                    level: 'beginner',
                })
                .expect(201);

            expect(response.body.course).toBeDefined();
            expect(response.body.course.title).toBe('Test Course');

            courseId = response.body.course._id;
        });

        it('should create module', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/courses/${courseId}/modules`)
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    title: 'Module 1',
                    description: 'First module',
                    order: 1,
                })
                .expect(201);

            expect(response.body.module).toBeDefined();
            moduleId = response.body.module._id;
        });

        it('should add video content', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/modules/${moduleId}/content`)
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    type: 'video',
                    title: 'Introduction Video',
                    videoUrl: 'https://example.com/video.mp4',
                    duration: 600,
                })
                .expect(201);

            expect(response.body.content).toBeDefined();
            expect(response.body.content.type).toBe('video');
        });

        it('should add quiz', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/modules/${moduleId}/content`)
                .set('Authorization', `Bearer ${schoolToken}`)
                .send({
                    type: 'quiz',
                    title: 'Module Quiz',
                    questions: [
                        {
                            question: 'What is 2+2?',
                            options: ['3', '4', '5', '6'],
                            correctAnswer: 1,
                        },
                    ],
                })
                .expect(201);

            expect(response.body.content).toBeDefined();
            expect(response.body.content.type).toBe('quiz');
        });

        it('should get course details', async () => {
            const response = await request(app.getHttpServer())
                .get(`/academy/courses/${courseId}`)
                .expect(200);

            expect(response.body.course).toBeDefined();
            expect(response.body.course.modules).toBeDefined();
            expect(response.body.course.modules.length).toBeGreaterThan(0);
        });
    });

    describe('Student Enrollment & Progress', () => {
        it('should enroll student', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/courses/${courseId}/enroll`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(201);

            expect(response.body.enrollment).toBeDefined();
            expect(response.body.enrollment.courseId).toBe(courseId);
        });

        it('should track progress', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/courses/${courseId}/progress`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    moduleId,
                    contentId: 'content_id_here',
                    completed: true,
                })
                .expect(200);

            expect(response.body.progress).toBeDefined();
        });

        it('should submit quiz', async () => {
            const response = await request(app.getHttpServer())
                .post(`/academy/quizzes/submit`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    quizId: 'quiz_id_here',
                    answers: [1],
                })
                .expect(200);

            expect(response.body.result).toBeDefined();
            expect(response.body.result).toHaveProperty('score');
            expect(response.body.result).toHaveProperty('passed');
        });

        it('should get student progress', async () => {
            const response = await request(app.getHttpServer())
                .get(`/academy/courses/${courseId}/my-progress`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body.progress).toBeDefined();
            expect(response.body.progress).toHaveProperty('completionPercentage');
        });
    });

    describe('Certificate Generation', () => {
        beforeAll(async () => {
            // Complete all course content
            await request(app.getHttpServer())
                .post(`/academy/courses/${courseId}/complete`)
                .set('Authorization', `Bearer ${studentToken}`);
        });

        it('should generate certificate on completion', async () => {
            const response = await request(app.getHttpServer())
                .post('/certificates/generate')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    courseId,
                })
                .expect(201);

            expect(response.body.certificate).toBeDefined();
            expect(response.body.certificate.pdfUrl).toBeDefined();
            expect(response.body.certificate.verificationCode).toBeDefined();
        });

        it('should get my certificates', async () => {
            const response = await request(app.getHttpServer())
                .get('/certificates/my-certificates')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body.certificates).toBeDefined();
            expect(response.body.certificates.length).toBeGreaterThan(0);
        });

        it('should verify certificate', async () => {
            const certsResponse = await request(app.getHttpServer())
                .get('/certificates/my-certificates')
                .set('Authorization', `Bearer ${studentToken}`);

            const verificationCode = certsResponse.body.certificates[0].verificationCode;

            const response = await request(app.getHttpServer())
                .get(`/certificates/verify/${verificationCode}`)
                .expect(200);

            expect(response.body.valid).toBe(true);
            expect(response.body.certificate).toBeDefined();
        });

        it('should download certificate PDF', async () => {
            const certsResponse = await request(app.getHttpServer())
                .get('/certificates/my-certificates')
                .set('Authorization', `Bearer ${studentToken}`);

            const certificateId = certsResponse.body.certificates[0]._id;

            const response = await request(app.getHttpServer())
                .get(`/certificates/${certificateId}/download`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.headers['content-type']).toBe('application/pdf');
        });

        it('should prevent duplicate certificate generation', async () => {
            await request(app.getHttpServer())
                .post('/certificates/generate')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    courseId,
                })
                .expect(400);
        });
    });

    describe('Course Limits (Free vs Premium)', () => {
        let freeSchoolToken: string;

        beforeAll(async () => {
            // Create free school user
            const freeSchoolSignup = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'free-school@test.com',
                    password: 'Test123!',
                    name: 'Free School',
                    type: 'school',
                });

            freeSchoolToken = freeSchoolSignup.body.token;
        });

        it('should limit free users to 3 courses', async () => {
            // Create 3 courses
            for (let i = 0; i < 3; i++) {
                await request(app.getHttpServer())
                    .post('/academy/courses')
                    .set('Authorization', `Bearer ${freeSchoolToken}`)
                    .send({
                        title: `Free Course ${i + 1}`,
                        description: 'Test',
                    })
                    .expect(201);
            }

            // Try to create 4th course
            await request(app.getHttpServer())
                .post('/academy/courses')
                .set('Authorization', `Bearer ${freeSchoolToken}`)
                .send({
                    title: 'Free Course 4',
                    description: 'Test',
                })
                .expect(403);
        });

        it('should allow unlimited courses for premium users', async () => {
            // Create many courses
            for (let i = 0; i < 10; i++) {
                await request(app.getHttpServer())
                    .post('/academy/courses')
                    .set('Authorization', `Bearer ${schoolToken}`)
                    .send({
                        title: `Premium Course ${i + 1}`,
                        description: 'Test',
                    })
                    .expect(201);
            }
        });
    });
});
