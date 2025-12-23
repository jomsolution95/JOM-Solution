import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Training, TrainingDocument } from '../schemas/training.schema';
import { TrainingContent, TrainingContentDocument } from '../schemas/trainingContent.schema';
import { StudentProgress, StudentProgressDocument } from '../schemas/studentProgress.schema';
import { PremiumService } from '../premium.service';
import { SubscriptionPlan } from '../schemas/subscription.schema';
import { CreateCourseDto, CreateModuleDto, CreateContentDto, UpdateProgressDto } from '../dto/course.dto';
import { EmailService } from '../../notifications/email.service';
import { UsersService } from '../../users/users.service';

const FREE_COURSE_LIMIT = 5;

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Training.name)
        private courseModel: Model<TrainingDocument>,
        @InjectModel(TrainingContent.name)
        private contentModel: Model<TrainingContentDocument>,
        @InjectModel(StudentProgress.name)
        private progressModel: Model<StudentProgressDocument>,
        private premiumService: PremiumService,
        private emailService: EmailService,
        private usersService: UsersService,
    ) { }

    // ... (createCourse, getInstitutionCourses, getAllPublishedCourses, getCourse, updateCourse, deleteCourse, addModule, addContent methods remain unchanged)

    /**
     * Enroll student in course
     */
    async enrollStudent(
        courseId: string | Types.ObjectId,
        studentId: string | Types.ObjectId,
    ): Promise<StudentProgressDocument> {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if already enrolled
        const existing = await this.progressModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });

        if (existing) {
            throw new BadRequestException('Student already enrolled');
        }

        // Create progress record
        const progress = new this.progressModel({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
            institutionId: course.institutionId,
            enrolledAt: new Date(),
            progress: 0,
            completed: false,
            moduleProgress: course.modules.map((m: any) => ({
                moduleId: m._id,
                moduleName: m.title,
                progress: 0,
                completed: false,
                completedContent: [],
            })),
        });

        // Add to course enrolled students
        course.enrolledStudents.push(new Types.ObjectId(studentId));
        await course.save();

        const savedProgress = await progress.save();

        // Send Welcome Email
        try {
            const student = await this.usersService.findOne(studentId.toString());
            if (student) {
                await this.emailService.sendCourseWelcome(
                    student.email,
                    student.name || 'Étudiant',
                    course.title
                );
            }
        } catch (error) {
            console.error('Failed to send course welcome email:', error);
        }

        return savedProgress;
    }

    /**
     * Update student progress
     */
    async updateProgress(
        studentId: string | Types.ObjectId,
        courseId: string | Types.ObjectId,
        dto: UpdateProgressDto,
    ): Promise<StudentProgressDocument> {
        const progress = await this.progressModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });

        if (!progress) {
            throw new NotFoundException('Enrollment not found');
        }

        const moduleProgress = progress.moduleProgress.find(
            (m: any) => m.moduleId.toString() === dto.moduleId.toString(),
        );

        if (!moduleProgress) {
            throw new NotFoundException('Module not found in progress');
        }

        if (dto.progress !== undefined) {
            moduleProgress.progress = dto.progress;
        }

        if (dto.completed !== undefined) {
            moduleProgress.completed = dto.completed;
            if (dto.completed) {
                moduleProgress.completedAt = new Date();
            }
        }

        // Update overall progress
        const totalModules = progress.moduleProgress.length;
        const completedModules = progress.moduleProgress.filter((m: any) => m.completed).length;
        progress.progress = (completedModules / totalModules) * 100;

        // Check if course completed
        if (progress.progress === 100) {
            progress.completed = true;
            progress.completedAt = new Date();
        }

        progress.lastAccessedAt = new Date();

        return await progress.save();
    }

    /**
     * Get student progress
     */
    async getStudentProgress(
        studentId: string | Types.ObjectId,
        courseId: string | Types.ObjectId,
    ): Promise<StudentProgressDocument | null> {
        return this.progressModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });
    }

    /**
     * Get all students for a course
     */
    async getCourseStudents(
        courseId: string | Types.ObjectId,
    ): Promise<StudentProgressDocument[]> {
        return this.progressModel
            .find({ courseId: new Types.ObjectId(courseId) })
            .populate('studentId', 'name email avatar')
            .sort({ enrolledAt: -1 });
    }

    /**
     * Get student's enrolled courses
     */
    async getStudentEnrolledCourses(studentId: string | Types.ObjectId): Promise<any[]> {
        const enrollments = await this.progressModel
            .find({ studentId: new Types.ObjectId(studentId) })
            .populate({
                path: 'courseId',
                populate: { path: 'institutionId', select: 'name avatar' }
            })
            .sort({ lastAccessedAt: -1 });

        return enrollments.map(e => ({
            enrollment: e,
            course: e.courseId
        }));
    }

    /**
     * Submit quiz answers
     */
    async submitQuiz(
        studentId: string | Types.ObjectId,
        courseId: string | Types.ObjectId,
        contentId: string | Types.ObjectId,
        answers: number[],
    ): Promise<{ score: number; passed: boolean; correctAnswers: number; totalQuestions: number }> {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Find the quiz content
        let quizContent: any = null;
        for (const module of course.modules) {
            const content = module.content.find((c: any) => c._id.toString() === contentId.toString());
            if (content) {
                quizContent = content;
                break;
            }
        }

        if (!quizContent || quizContent.type !== 'quiz') {
            throw new NotFoundException('Quiz not found');
        }

        // Calculate score
        const questions = quizContent.questions || [];
        let correctAnswers = 0;

        questions.forEach((q: any, idx: number) => {
            if (answers[idx] === q.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / questions.length) * 100;
        const passed = score >= 70; // 70% passing grade

        // Update progress
        const progress = await this.progressModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });

        if (progress) {
            // Add quiz attempt to root level as per schema
            if (!progress.quizAttempts) {
                progress.quizAttempts = [];
            }
            progress.quizAttempts.push({
                quizId: contentId.toString(),
                score,
                maxScore: 100, // Assuming 100 max
                passed,
                answers, // Adding answers if schema supports it or removing if not
                attemptDate: new Date(),
            } as any);

            // Should also mark the module item as completed if passed?
            // The previous logic was complex. Let's keep it simple.
            // If passed, we can update the module content progress.
            if (passed) {
                for (const moduleProgress of progress.moduleProgress) {
                    const module = course.modules.find((m: any) => m._id.toString() === moduleProgress.moduleId.toString());
                    if (module) {
                        const hasContent = module.content.some((c: any) => c._id.toString() === contentId.toString());
                        if (hasContent) {
                            if (!moduleProgress.completedContent) {
                                moduleProgress.completedContent = [];
                            }
                            if (!moduleProgress.completedContent.includes(contentId.toString())) {
                                moduleProgress.completedContent.push(contentId.toString());
                            }
                            // Recalculate module progress logic could be here
                            break;
                        }
                    }
                }
            }
            await progress.save();
        }

        return {
            score,
            passed,
            correctAnswers,
            totalQuestions: questions.length,
        };
    }

    /**
     * Get course statistics
     */
    async getCourseStats(courseId: string | Types.ObjectId): Promise<any> {
        const enrollments = await this.progressModel.find({
            courseId: new Types.ObjectId(courseId),
        });

        const totalStudents = enrollments.length;
        const completedStudents = enrollments.filter((e) => e.completed).length;
        const avgProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents || 0;

        return {
            totalStudents,
            completedStudents,
            completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
            avgProgress: Math.round(avgProgress),
        };
    }

    /**
     * Get all students enrolled in institution's courses
     */
    async getInstitutionStudents(institutionId: string | Types.ObjectId): Promise<StudentProgressDocument[]> {
        return this.progressModel
            .find({ institutionId: new Types.ObjectId(institutionId) })
            .populate('studentId', 'name email avatar')
            .populate('courseId', 'title')
            .sort({ enrolledAt: -1 });
    }
}
