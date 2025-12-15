import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true })
    userId!: string;

    @Prop({ required: true })
    type!: string;

    @Prop({ required: true })
    content!: string;

    @Prop()
    jobId?: string;

    @Prop({ default: 'public' })
    visibility!: string;

    @Prop({ type: Object })
    metadata?: any;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({ type: [String] })
    likes?: string[];

    @Prop({ type: [Object] })
    comments?: any[];

    @Prop({ type: [String] })
    shares?: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
