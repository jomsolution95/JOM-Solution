
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

// Configuration from observed environment
// Configuration from observed environment
const MONGO_URI = 'mongodb+srv://jomsolution95_db_user:AlhamdulilLah95@clusterjomsolution.f6sns0s.mongodb.net/jom_solution_db?retryWrites=true&w=majority&appName=ClusterJomSolution';


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['individual'] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, select: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function bootstrap() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const email = 'jomsolution95@gmail.com';
        const password = 'AlhamdulilLah95';

        console.log(`Resetting user: ${email}`);

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        const result = await User.findOneAndUpdate(
            { email },
            {
                email,
                passwordHash: hash,
                roles: ['super_admin', 'admin', 'individual'], // Lowercase to match usage seen in Dashboard
                isVerified: true,
                isActive: true
            },
            { new: true, upsert: true }
        );

        console.log('SUCCESS: User updated/created.');
        console.log('Roles:', result?.roles);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

bootstrap();
