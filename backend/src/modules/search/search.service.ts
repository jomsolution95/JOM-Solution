import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Job } from '../jobs/schemas/job.schema';
import { Service } from '../services/schemas/service.schema';
import { Training } from '../premium/schemas/training.schema';
import { Profile } from '../users/schemas/profile.schema';

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(User.name) private userModel: Model<any>,
        @InjectModel(Profile.name) private profileModel: Model<any>,
        @InjectModel(Job.name) private jobModel: Model<any>,
        @InjectModel(Service.name) private serviceModel: Model<any>,
        @InjectModel(Training.name) private trainingModel: Model<any>,
    ) { }

    async searchGlobal(query: string) {
        if (!query || query.length < 2) return { users: [], jobs: [], services: [], trainings: [] };

        const regex = new RegExp(query, 'i');

        const [profiles, jobs, services, trainings] = await Promise.all([
            // 1. Search Profiles (Name, Skills, Title)
            this.profileModel.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { displayName: regex },
                    { title: regex },
                    { skills: { $in: [regex] } }
                ]
            }).select('firstName lastName displayName title avatarUrl user').populate('user', 'name roles').limit(5),

            // 2. Search Jobs (Title, Description, Company)
            this.jobModel.find({
                $or: [
                    { title: regex },
                    { description: regex },
                    { 'company.name': regex } // Assuming embedded or handled otherwise, check schema later
                ],
                status: 'active'
            }).select('title company location salaryType').limit(5),

            // 3. Search Services (Title, Description, Category)
            this.serviceModel.find({
                $or: [
                    { title: regex },
                    { description: regex },
                    { category: regex }
                ]
            }).select('title price category images').limit(5),

            // 4. Search Trainings (Title, Description)
            this.trainingModel.find({
                $or: [
                    { title: regex },
                    { description: regex }
                ]
            }).select('title price level duration').limit(5)
        ]);

        // Map profiles to user format expectation or keep as is
        const users = profiles.map(p => ({
            _id: p.user && (p.user as any)._id ? (p.user as any)._id : p._id, // Prefer User ID for profile navigation
            profileId: p._id,
            firstName: p.firstName,
            lastName: p.lastName,
            name: p.displayName || (p.user ? (p.user as any).name : ''),
            title: p.title,
            avatar: p.avatarUrl,
            role: p.user ? (p.user as any).roles?.[0] : 'individual'
        }));

        return {
            users,
            jobs,
            services,
            trainings
        };
    }
}
