
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
// Faker dependency removed to avoid install issues
// Since I cannot ensure faker is installed, I will use simple random generators.

// --- CONFIG ---
const MONGO_URI = 'mongodb+srv://jomsolution95_db_user:AlhamdulilLah95@clusterjomsolution.f6sns0s.mongodb.net/jom_solution_db?retryWrites=true&w=majority&appName=ClusterJomSolution';

// --- SCHEMAS (Minimal versions for seeding) ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['individual'] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    kycStatus: { type: String, default: 'NONE' },
    kycDocuments: { type: [String], default: [] },
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
    title: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: Number,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    amount: Number,
    status: { type: String, default: 'pending' }, // pending, in_progress, delivered, completed
}, { timestamps: true });

const escrowSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    status: { type: String, default: 'held' }, // held, released
}, { timestamps: true });

// --- MODELS ---
const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const Order = mongoose.model('Order', orderSchema);
const Escrow = mongoose.model('Escrow', escrowSchema);

// --- SEED LOGIC ---
async function bootstrap() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Cleaning up (except Super Admin)...');
        // Keep the Super Admin functionality intact, but maybe refresh others
        await Service.deleteMany({});
        await Order.deleteMany({});
        await Escrow.deleteMany({});
        // Only delete non-super-admin users to preserve your login
        await User.deleteMany({ email: { $ne: 'jomsolution95@gmail.com' } });

        console.log('Seeding Users...');
        const salt = await bcrypt.genSalt();
        const commonPassword = await bcrypt.hash('password123', salt);

        const users = [];
        for (let i = 0; i < 10; i++) {
            const role = i % 3 === 0 ? 'company' : 'individual';
            const isVerified = i > 4; // Use first 5 for unverified scenarios
            const kycStatus = !isVerified && i < 3 ? 'PENDING' : 'NONE'; // 3 pending users

            users.push({
                email: `user${i + 1}@example.com`,
                passwordHash: commonPassword,
                roles: [role],
                isVerified,
                isActive: true,
                kycStatus,
                kycDocuments: kycStatus === 'PENDING' ? ['https://via.placeholder.com/300x200?text=ID+Card+Front', 'https://via.placeholder.com/300x200?text=Passport'] : []
            });
        }
        const createdUsers = await User.insertMany(users);
        console.log(`Created ${createdUsers.length} users.`);

        console.log('Seeding Services...');
        const seller = createdUsers[0];
        const buyer = createdUsers[1];

        const services = [];
        for (let i = 0; i < 5; i++) {
            services.push({
                title: `Service Test ${i + 1}`,
                owner: seller._id,
                price: 5000 * (i + 1)
            });
        }
        const createdServices = await Service.insertMany(services);

        console.log('Seeding Orders & Escrow...');
        const orders = [];
        const escrows = [];

        for (let i = 0; i < 5; i++) {
            const service = createdServices[i];
            const amount = service.price;

            const order = new Order({
                buyer: buyer._id,
                seller: seller._id,
                service: service._id,
                amount: amount,
                status: i < 3 ? 'in_progress' : 'completed'
            });
            orders.push(order);

            if (i < 3) {
                // Active orders have money held in escrow
                escrows.push(new Escrow({
                    order: order._id,
                    amount: amount,
                    status: 'held'
                }));
            }
        }

        await Order.insertMany(orders);
        await Escrow.insertMany(escrows);

        console.log(`Created ${orders.length} orders and ${escrows.length} escrow records.`);
        console.log('SEEDING COMPLETE!');

    } catch (error) {
        console.error('SEEDING FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
}

bootstrap();
