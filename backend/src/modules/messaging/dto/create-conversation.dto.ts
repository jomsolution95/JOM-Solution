import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class CreateConversationDto {
    @IsArray()
    @IsMongoId({ each: true })
    participants: string[];

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    initialMessage?: string;
}
