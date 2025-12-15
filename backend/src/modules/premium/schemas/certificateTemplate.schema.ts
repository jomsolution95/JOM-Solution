
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CertificateTemplateDocument = CertificateTemplate & Document;

@Schema({ timestamps: true })
export class CertificateTemplate {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    institutionId!: Types.ObjectId;

    @Prop({ required: true })
    name!: string;

    @Prop()
    backgroundImageUrl?: string; // URL of the background image

    @Prop()
    textColor?: string;

    @Prop({ type: Object })
    layout!: {
        studentName: { x: number, y: number, fontSize: number, visible: boolean };
        courseName: { x: number, y: number, fontSize: number, visible: boolean };
        date: { x: number, y: number, fontSize: number, visible: boolean };
        signature: { x: number, y: number, fontSize: number, visible: boolean, customText?: string };
    };

    @Prop({ default: false })
    isDefault!: boolean;
}

export const CertificateTemplateSchema = SchemaFactory.createForClass(CertificateTemplate);
