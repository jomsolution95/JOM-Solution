import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';

@Injectable()
export class CouponsService {
    constructor(
        @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    ) { }

    async createCoupon(code: string, discountType: 'PERCENTAGE' | 'FIXED', amount: number, maxUses?: number, expiryDate?: Date) {
        const coupon = new this.couponModel({
            code,
            discountType,
            amount,
            maxUses,
            expiryDate,
        });
        return coupon.save();
    }

    async getAllCoupons() {
        return this.couponModel.find().sort({ createdAt: -1 });
    }

    async deleteCoupon(id: string) {
        return this.couponModel.findByIdAndDelete(id);
    }

    async validateCoupon(code: string) {
        const coupon = await this.couponModel.findOne({ code: code.toUpperCase() });
        if (!coupon) throw new NotFoundException('Coupon not found');

        if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
        if (coupon.expiryDate && new Date() > coupon.expiryDate) throw new BadRequestException('Coupon expired');
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');

        return coupon;
    }

    async useCoupon(code: string) {
        const coupon = await this.validateCoupon(code);
        coupon.usedCount += 1;
        await coupon.save();
        return coupon;
    }
}
