import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin/coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @Get()
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getAllCoupons() {
        return this.couponsService.getAllCoupons();
    }

    @Post()
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async createCoupon(@Body() body: {
        code: string;
        discountType: 'PERCENTAGE' | 'FIXED';
        amount: number;
        maxUses?: number;
        expiryDate?: string
    }) {
        return this.couponsService.createCoupon(
            body.code,
            body.discountType,
            body.amount,
            body.maxUses,
            body.expiryDate ? new Date(body.expiryDate) : undefined
        );
    }

    @Delete(':id')
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async deleteCoupon(@Param('id') id: string) {
        return this.couponsService.deleteCoupon(id);
    }
}
