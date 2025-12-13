import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService implements OnModuleInit {
    private uploadDir: string;

    constructor(private configService: ConfigService) {
        // Define root upload directory (relative to backend root, e.g., 'backend/uploads')
        this.uploadDir = path.resolve(__dirname, '..', '..', '..', '..', 'uploads');
    }

    onModuleInit() {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Upload file to Local Storage
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'misc', // Folder name relative to /uploads
    ): Promise<{ url: string; public_id: string; key: string }> {
        // Sanitize folder name
        const targetDir = path.join(this.uploadDir, folder);

        // Ensure subfolder exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Generate filename
        const filename = `${uuidv4()}_${file.originalname.replace(/\s+/g, '_')}`; // Basic sanitization
        const filePath = path.join(targetDir, filename);

        try {
            // Write file to disk
            await fs.promises.writeFile(filePath, file.buffer);

            // Construct Public URL
            // Format: APP_URL/uploads/folder/filename
            const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
            // We use posix style paths for URLs
            const urlPath = path.posix.join('uploads', folder, filename);
            const publicUrl = `${appUrl}/${urlPath}`;

            return {
                url: publicUrl,
                public_id: path.join(folder, filename), // Store relative path as ID
                key: filename,
            };
        } catch (error: any) {
            console.error(`Local upload failed: ${error.message}`);
            throw new BadRequestException(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Upload Video
     */
    async uploadVideo(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid video format. Allowed: MP4, WebM, OGG');
        }

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('Video file too large. Maximum size: 500MB');
        }

        return this.uploadFile(file, 'videos');
    }

    /**
     * Upload PDF
     */
    async uploadPDF(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Invalid file format. Only PDF allowed');
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            throw new BadRequestException('PDF file too large. Maximum size: 50MB');
        }

        return this.uploadFile(file, 'documents');
    }

    /**
     * Delete file from Local Storage
     */
    async deleteFile(publicId: string): Promise<void> {
        try {
            // publicId is "folder/filename" or just "filename" depending on usage
            const filePath = path.join(this.uploadDir, publicId);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error: any) {
            console.warn(`File deletion failed: ${error.message}`);
            // Don't crash
        }
    }
}
