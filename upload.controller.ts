
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './services/file-upload.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller('upload')
@UseGuards(AccessTokenGuard)
export class UploadController {
    constructor(private readonly fileUploadService: FileUploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file (image, pdf)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Determine file type and delegate
        if (file.mimetype.startsWith('image/')) {
            return this.fileUploadService.uploadFile(file, 'images');
        } else if (file.mimetype === 'application/pdf') {
            return this.fileUploadService.uploadPDF(file);
        } else if (file.mimetype.startsWith('video/')) {
            return this.fileUploadService.uploadVideo(file);
        } else {
            // Default fallback
            return this.fileUploadService.uploadFile(file, 'misc');
        }
    }
}
