import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
    @IsMongoId()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}
