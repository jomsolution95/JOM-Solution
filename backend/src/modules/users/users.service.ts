import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Validation logic for duplicates usually handled by AuthController/Register
        const password = createUserDto.password || 'Default@123'; // Default for admin-created users without password
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            passwordHash: hashedPassword,
        });
        return createdUser.save();
    }

    async findAll(paginationDto: PaginationDto, filters: any = {}): Promise<{ data: User[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.userModel.find(filters);
        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments(filters).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updates: any = { ...updateUserDto };
        if (updates.password) {
            updates.passwordHash = await bcrypt.hash(updates.password, 10);
            delete updates.password;
        }

        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updates, { new: true })
            .exec();

        if (!updatedUser) throw new NotFoundException(`User with ID ${id} not found`);
        return updatedUser;
    }

    async remove(id: string): Promise<User> {
        const deletedUser = await this.userModel
            .findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true })
            .exec();

        if (!deletedUser) throw new NotFoundException(`User with ID ${id} not found`);
        return deletedUser;
    }

    async search(searchDto: SearchDto): Promise<{ data: User[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        const filter = q ? {
            $or: [
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
            ],
        } : {};

        const [data, total] = await Promise.all([
            this.userModel.find(filter).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);

        return { data, total };
    }
}
