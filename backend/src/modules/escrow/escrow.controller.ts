import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('escrow')
@UseGuards(AccessTokenGuard, RolesGuard)
export class EscrowController {
    constructor(private readonly escrowService: EscrowService) { }

    @Post(':id/release')
    @Roles(UserRole.ADMIN) // Only admin or system logic should trigger this manually via API
    release(@Param('id') id: string) {
        return this.escrowService.releaseFunds(id);
    }

    @Post(':id/refund')
    @Roles(UserRole.ADMIN)
    refund(@Param('id') id: string) {
        return this.escrowService.refundFunds(id);
    }
}
