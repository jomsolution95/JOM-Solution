import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
    @IsMongoId()
    @IsNotEmpty()
    receiverId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsArray()
    attachments?: string[];
}
