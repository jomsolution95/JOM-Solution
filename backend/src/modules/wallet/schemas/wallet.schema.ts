import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user!: User;

    @Prop({ default: 0, min: 0 })
    balance!: number;

    @Prop({ default: 'XOF' })
    currency!: string;

    @Prop({ default: true })
    isActive!: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);


export type WalletTransactionDocument = WalletTransaction & Document;

export enum WalletTransactionType {
    CREDIT = 'CREDIT', // Earnings
    DEBIT = 'DEBIT',   // Withdrawal
}

@Schema({ timestamps: true })
export class WalletTransaction {
    @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
    wallet!: Wallet;

    @Prop({ required: true, enum: WalletTransactionType })
    type!: WalletTransactionType;

    @Prop({ required: true })
    amount!: number;

    @Prop({ required: true })
    description!: string;

    @Prop({ type: Types.ObjectId, ref: 'Order' }) // Optional reference to source
    order?: Types.ObjectId;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
WalletTransactionSchema.index({ wallet: 1 });
