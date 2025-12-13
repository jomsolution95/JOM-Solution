import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum AdminAction {
    BAN_USER = 'ban_user',
    APPROVE_JOB = 'approve_job',
    VERIFY_USER = 'verify_user',
    DELETE_CONTENT = 'delete_content',
}

export class CreateAdminActionDto {
    @IsEnum(AdminAction)
    action: AdminAction;

    @IsString()
    @IsNotEmpty()
    targetId: string; // UserId, JobId, etc.

    @IsOptional()
    @IsString()
    reason?: string;
}
