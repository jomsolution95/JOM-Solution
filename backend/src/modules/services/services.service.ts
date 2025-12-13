import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class ServicesService {
    constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) { }

    async create(createServiceDto: CreateServiceDto, userId: string): Promise<Service> {
        const createdService = new this.serviceModel({
            ...createServiceDto,
            provider: userId,
        });
        return createdService.save();
    }

    async findAll(paginationDto: PaginationDto, filters: any = {}): Promise<{ data: Service[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const queryFilters: any = { isActive: true, deletedAt: null, ...filters };
        if (filters.minPrice || filters.maxPrice) {
            queryFilters.basePrice = {};
            if (filters.minPrice) queryFilters.basePrice.$gte = Number(filters.minPrice);
            if (filters.maxPrice) queryFilters.basePrice.$lte = Number(filters.maxPrice);
            delete queryFilters.minPrice;
            delete queryFilters.maxPrice;
        }

        const query = this.serviceModel.find(queryFilters).populate('provider', 'email isVerified');
        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.serviceModel.countDocuments(queryFilters).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Service> {
        const service = await this.serviceModel.findOne({ _id: id, deletedAt: null }).populate('provider', 'email isVerified roles').exec();
        if (!service) throw new NotFoundException(`Service with ID ${id} not found`);
        return service;
    }

    async update(id: string, updateServiceDto: UpdateServiceDto, userId: string, isAdmin: boolean = false): Promise<Service> {
        const service = await this.serviceModel.findById(id);
        if (!service) throw new NotFoundException(`Service with ID ${id} not found`);

        if (service.provider.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to update this service');
        }

        const updatedService = await this.serviceModel
            .findByIdAndUpdate(id, updateServiceDto, { new: true })
            .exec();

        return updatedService!;
    }

    async remove(id: string, userId: string, isAdmin: boolean = false): Promise<Service> {
        const service = await this.serviceModel.findById(id);
        if (!service) throw new NotFoundException(`Service with ID ${id} not found`);

        if (service.provider.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to delete this service');
        }

        // Soft delete
        service.deletedAt = new Date();
        service.isActive = false;
        return service.save();
    }

    async search(searchDto: SearchDto): Promise<{ data: Service[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        const filter: any = { isActive: true, deletedAt: null };
        if (q) {
            filter.$text = { $search: q };
        }

        const [data, total] = await Promise.all([
            this.serviceModel.find(filter).populate('provider', 'email isVerified').skip(skip).limit(limit).exec(),
            this.serviceModel.countDocuments(filter).exec(),
        ]);

        return { data, total };
    }
}
