import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post as SocialPost, PostDocument } from './schemas/post.schema';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { Request } from 'express';
import { Job } from '../jobs/schemas/job.schema';
import { Service } from '../services/schemas/service.schema';
import { Training } from './schemas/training.schema';

@Controller('posts')
export class PostsController {
    constructor(
        @InjectModel(SocialPost.name) private postModel: Model<PostDocument>,
        @InjectModel(Job.name) private jobModel: Model<any>,
        @InjectModel(Service.name) private serviceModel: Model<any>,
        @InjectModel(Training.name) private trainingModel: Model<any>,
    ) { }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const skip = (page - 1) * limit;

        // Fetch recent items from all collections
        // Note: In a high-scale app, we would use an aggregation pipeline or dedicated Feed collection.
        // For MVP, parallel queries + in-memory merge is acceptable.

        const [jobs, services, trainings] = await Promise.all([
            this.jobModel.find({ status: 'active' })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('company', 'name email logo') // Assuming company is usually embedded or referenced
                .lean(),
            this.serviceModel.find({ status: 'active' }) // Assuming status field exists or default is active
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            this.trainingModel.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean()
        ]);

        // Transform to SocialPost format
        const feedItems = [
            ...jobs.map((j: any) => ({
                _id: j._id,
                type: 'job_offer',
                content: j.description ? j.description.substring(0, 200) + '...' : `Nouvelle offre d'emploi : ${j.title}`,
                createdAt: j.createdAt || j.postedAt,
                likes: [], // Mocks
                comments: [],
                shares: [],
                author: {
                    _id: j.company?._id || 'admin',
                    firstName: j.company?.name || 'Entreprise',
                    lastName: '',
                    avatar: j.company?.logo || 'https://ui-avatars.com/api/?name=Job+Offer',
                    roles: ['company'],
                    headline: 'Recruteur'
                },
                metadata: {
                    jobDetails: {
                        title: j.title,
                        location: j.location,
                        salary: j.salary
                    }
                }
            })),
            ...services.map((s: any) => ({
                _id: s._id,
                type: 'service_offer',
                content: s.description ? s.description.substring(0, 200) + '...' : `Nouveau service disponible : ${s.title}`,
                createdAt: s.createdAt,
                likes: [],
                comments: [],
                shares: [],
                image: s.images?.[0], // Use first image
                author: {
                    _id: s.provider?._id || 'admin', // Need to check if service has provider ref
                    firstName: s.providerName || 'Prestataire',
                    lastName: '',
                    avatar: 'https://ui-avatars.com/api/?name=Service',
                    roles: ['individual'],
                    headline: s.category
                },
                metadata: {
                    serviceDetails: {
                        title: s.title,
                        price: s.price,
                        category: s.category
                    }
                }
            })),
            ...trainings.map((t: any) => ({
                _id: t._id,
                type: 'training_offer', // Custom type mapping to be handled in frontend
                content: t.description ? t.description.substring(0, 200) + '...' : `Nouvelle formation : ${t.title}`,
                createdAt: t.createdAt,
                likes: [],
                comments: [],
                shares: [],
                image: t.thumbnailUrl,
                author: {
                    _id: 'academy',
                    firstName: 'JOM',
                    lastName: 'Academy',
                    avatar: 'https://ui-avatars.com/api/?name=JOM+Academy&background=0D8ABC&color=fff',
                    roles: ['etablissement'],
                    headline: 'Formation Certifiante' // Should come from institution name if avail
                },
                metadata: {
                    trainingDetails: {
                        title: t.title,
                        level: t.level,
                        price: t.price
                    }
                }
            }))
        ];

        // Sort combined feed by date
        feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Paginate
        const paginatedFeed = feedItems.slice(skip, skip + limit);

        return { data: paginatedFeed, total: feedItems.length, page, limit };
    }

    @UseGuards(AccessTokenGuard)
    @Post()
    async create(@Body() createPostDto: any, @Req() req: Request) {
        // Disable creation for now or keep for manual admin posts
        return null;
    }
}
