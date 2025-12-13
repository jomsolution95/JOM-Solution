import { IsNotEmpty, IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
    @IsMongoId()
    @IsNotEmpty()
    recipientId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsOptional()
    @IsString()
    link?: string;
}
