import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {
    @Prop({ required: true, unique: true, trim: true })
    name!: string;

    @Prop()
    category?: string;

    @Prop({ default: 0 })
    usageCount!: number;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
SkillSchema.index({ name: 1 });
