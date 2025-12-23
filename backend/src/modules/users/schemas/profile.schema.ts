import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user!: User;

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    displayName?: string; // For companies/schools

    @Prop()
    avatarUrl?: string;

    @Prop()
    coverUrl?: string;

    @Prop()
    bio?: string;

    @Prop()
    phone?: string;

    @Prop()
    location?: string;

    @Prop({ type: [String], default: [] })
    skills!: string[];

    // Structure for experience/education could be refined further or embedded
    @Prop({ type: [{ title: String, organization: String, startDate: Date, endDate: Date, description: String }] })
    experience!: Record<string, any>[];

    @Prop({ type: [{ degree: String, school: String, year: Number }] })
    education!: Record<string, any>[];

    @Prop({ type: Object })
    companyDetails?: {
        size?: string;
        website?: string;
        industry?: string;
    };

    @Prop({ type: [{ name: String, url: String, type: String, date: Date }] })
    documents?: { name: string; url: string; type: string; date: Date }[];
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
