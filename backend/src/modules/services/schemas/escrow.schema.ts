import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './order.schema';

export type EscrowDocument = Escrow & Document;

export enum EscrowStatus {
    HELD = 'held',
    RELEASED = 'released',
    REFUNDED = 'refunded',
    DISPUTED = 'disputed',
}

@Schema({ timestamps: true })
export class Escrow {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true })
    order!: Order;

    @Prop({ type: Types.ObjectId, ref: 'Transaction' })
    transaction?: any; // Linked deposit transaction

    @Prop({ required: true, enum: EscrowStatus, default: EscrowStatus.HELD })
    status!: EscrowStatus;

    @Prop({ required: true })
    amount!: number;

    @Prop({ default: false })
    isReleased!: boolean; // Deprecated by status, but keep for backward compat if needed? No, let's rely on status.

    @Prop()
    releasedAt?: Date;

    @Prop()
    refundedAt?: Date;
}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);
