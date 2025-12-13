import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CourseService } from './services/course.service';
import { FileUploadService } from './services/file-upload.service';
import {
    CreateCourseDto,
    UpdateCourseDto,
    CreateModuleDto,
    CreateContentDto,
    EnrollStudentDto,
    UpdateProgressDto,
    SubmitQuizDto,
} from './dto/course.dto';

@Controller('academy')
@UseGuards(JwtAuthGuard)
export class AcademyController {
    constructor(
        private readonly courseService: CourseService,
        private readonly fileUploadService: FileUploadService,
    ) { }

    /**
     * Create course
     */
    @Post('courses')
    async createCourse(@Request() req: any, @Body() dto: CreateCourseDto) {
        const course = await this.courseService.createCourse(req.user.userId, dto);
        return { course };
    }

    /**
     * Get institution's courses
     */
    @Get('courses')
    async getCourses(@Request() req: any) {
        const courses = await this.courseService.getInstitutionCourses(req.user.userId);
        return { courses };
    }

    /**
     * Get single course
     */
    @Get('courses/:id')
    async getCourse(@Param('id') id: string) {
        const course = await this.courseService.getCourse(id);
        return { course };
    }

    /**
     * Update course
     */
    @Put('courses/:id')
    async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
        const course = await this.courseService.updateCourse(id, dto);
        return { course };
    }

    /**
     * Delete course
     */
    @Delete('courses/:id')
    async deleteCourse(@Param('id') id: string) {
        await this.courseService.deleteCourse(id);
        return { deleted: true };
    }

    /**
     * Add module to course
     */
    @Post('courses/:id/modules')
    async addModule(@Param('id') id: string, @Body() dto: CreateModuleDto) {
        const course = await this.courseService.addModule(id, dto);
        return { course };
    }

    /**
     * Add content to module
     */
    @Post('courses/:courseId/modules/:moduleId/content')
    async addContent(
        @Param('courseId') courseId: string,
        @Param('moduleId') moduleId: string,
        @Body() dto: CreateContentDto,
    ) {
        const course = await this.courseService.addContent(courseId, moduleId, dto);
        return { course };
    }

    /**
     * Upload video
     */
    @Post('upload/video')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        const result = await this.fileUploadService.uploadVideo(file);
        return result;
    }

    /**
     * Upload PDF
     */
    @Post('upload/pdf')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPDF(@UploadedFile() file: Express.Multer.File) {
        const result = await this.fileUploadService.uploadPDF(file);
        return result;
    }

    /**
     * Enroll student
     */
    @Post('enroll')
    async enrollStudent(@Body() dto: EnrollStudentDto) {
        const progress = await this.courseService.enrollStudent(dto.courseId, dto.studentId);
        return { progress };
    }

    /**
     * Update student progress
     */
    @Put('progress/:courseId')
    async updateProgress(
        @Request() req: any,
        @Param('courseId') courseId: string,
        @Body() dto: UpdateProgressDto,
    ) {
        const progress = await this.courseService.updateProgress(req.user.userId, courseId, dto);
        return { progress };
    }

    /**
     * Get student progress
     */
    @Get('progress/:courseId')
    async getProgress(@Request() req: any, @Param('courseId') courseId: string) {
        const progress = await this.courseService.getStudentProgress(req.user.userId, courseId);
        return { progress };
    }

    /**
     * Get course students
     */
    @Get('courses/:id/students')
    async getCourseStudents(@Param('id') id: string) {
        const students = await this.courseService.getCourseStudents(id);
        return { students };
    }

    /**
     * Submit quiz
     */
    @Post('quiz/submit')
    async submitQuiz(@Request() req: any, @Body() dto: SubmitQuizDto) {
        const result = await this.courseService.submitQuiz(
            req.user.userId,
            dto.contentId,
            dto.contentId,
            dto.answers,
        );
        return result;
    }

    /**
     * Get course statistics
     */
    @Get('courses/:id/stats')
    async getCourseStats(@Param('id') id: string) {
        const stats = await this.courseService.getCourseStats(id);
        return { stats };
    }
}
