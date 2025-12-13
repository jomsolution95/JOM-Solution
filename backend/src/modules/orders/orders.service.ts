import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EscrowService } from '../escrow/escrow.service';
import { Order, OrderDocument, OrderStatus } from '../services/schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ServicesService } from '../services/services.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private servicesService: ServicesService,
        @Inject(forwardRef(() => EscrowService)) private readonly escrowService: EscrowService,
    ) { }

    async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<Order> {
        const service = await this.servicesService.findOne(createOrderDto.serviceId);
        if (service.provider.toString() === buyerId) {
            throw new BadRequestException('You cannot order your own service');
        }

        const createdOrder = new this.orderModel({
            ...createOrderDto,
            buyer: buyerId,
            seller: service.provider,
            amount: service.basePrice,
            status: OrderStatus.PENDING,
        });

        return createdOrder.save();
    }

    async findAll(paginationDto: PaginationDto, userId: string, isAdmin: boolean = false): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (!isAdmin) {
            filter.$or = [{ buyer: userId }, { seller: userId }];
        }

        const query = this.orderModel.find(filter)
            .populate('service', 'title')
            .populate('buyer', 'email isVerified')
            .populate('seller', 'email isVerified');

        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.orderModel.countDocuments(filter).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string, userId: string, isAdmin: boolean = false): Promise<Order> {
        const order = await this.orderModel.findById(id)
            .populate('service')
            .populate('buyer', 'email')
            .populate('seller', 'email')
            .exec();

        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

        if (order.buyer.toString() !== userId && order.seller.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to view this order');
        }

        return order;
    }

    async updateStatus(id: string, status: OrderStatus, userId: string, isAdmin: boolean = false): Promise<Order> {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

        if (order.seller.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('Only the seller or admin can update the status');
        }

        order.status = status;
        return order.save();
    }

    async cancel(id: string, userId: string, isAdmin: boolean = false): Promise<Order> {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

        if (order.buyer.toString() !== userId && order.seller.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to cancel this order');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        order.status = OrderStatus.CANCELLED;
        return order.save();
    }

    // --- Secure Workflow Methods ---

    async deliverOrder(id: string, userId: string, files: string[]): Promise<Order> {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

        if (order.seller.toString() !== userId) {
            throw new ForbiddenException('Only the seller can deliver this order');
        }

        if (order.status !== OrderStatus.IN_PROGRESS) {
            // Need to ensure status allows delivery (e.g. IN_PROGRESS or PAID if implicit)
            // Assuming IN_PROGRESS is set upon payment/escrow creation
        }

        order.status = OrderStatus.DELIVERED;
        order.deliveredAt = new Date();
        // Auto-confirm in 3 days (72 hours)
        order.autoConfirmAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        order.deliveredFiles = files;

        return order.save();
    }

    async confirmOrder(id: string, userId: string): Promise<Order> {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

        // Check if user is buyer OR system/admin (for auto-confirm)
        // If userId is 'SYSTEM', bypass check.
        if (userId !== 'SYSTEM' && order.buyer.toString() !== userId) {
            throw new ForbiddenException('Only the buyer can confirm this order');
        }

        if (order.status !== OrderStatus.DELIVERED) {
            throw new BadRequestException('Order must be DELIVERED to be confirmed');
        }

        // Release Funds via Escrow
        await this.escrowService.releaseFundsByOrder(order._id.toString());

        // Order status is updated by EscrowService (completed) or we do it here?
        // EscrowService does it. Refresh/return updated order.
        const updated = await this.orderModel.findById(id);
        return updated!;
    }

    // Cron Job: Run every day at midnight to auto-confirm
    // We assume ScheduleModule is enabled in AppModule
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkAutoConfirmOrders() {
        this.logger.log('Checking for orders to auto-confirm...');
        const now = new Date();
        const ordersToConfirm = await this.orderModel.find({
            status: OrderStatus.DELIVERED,
            autoConfirmAt: { $lte: now },
        });

        this.logger.log(`Found ${ordersToConfirm.length} orders to confirm.`);

        for (const order of ordersToConfirm) {
            try {
                // Call confirmOrder as SYSTEM
                await this.confirmOrder(order._id.toString(), 'SYSTEM');
                this.logger.log(`Auto-confirmed Order #${order._id}`);
            } catch (err: any) {
                this.logger.error(`Failed to auto-confirm Order #${order._id}: ${err.message}`);
            }
        }
    }
}
