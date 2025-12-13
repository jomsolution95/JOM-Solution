import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CvDocument = Cv & Document;

@Schema({ timestamps: true, collection: 'cvs' })
export class Cv {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
    userId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    templateId: string;

    @Prop({ type: Object, required: true })
    content: Record<string, any>; // Stores the full JSON of the CV state

    @Prop()
    lastExportDate: Date;
}

export const CvSchema = SchemaFactory.createForClass(Cv);
