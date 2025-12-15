
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const reset = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jom-solution';
        console.log('Connecting to:', uri);

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Simple User Schema definition for update
        const userSchema = new mongoose.Schema({
            email: String,
            passwordHash: String,
            roles: [String]
        });
        const User = mongoose.model('User', userSchema);

        const email = 'jomsolution95@gmail.com';
        const password = 'AlhamdulilLah95';

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await User.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    passwordHash: hash,
                    roles: ['SUPER_ADMIN', 'ADMIN', 'INDIVIDUAL']
                }
            },
            { new: true, upsert: true } // Create if not exists (upsert)
        );

        console.log('✅ SUCCESS: User updated.');
        console.log('Email:', result.email);
        console.log('New Hash:', result.passwordHash);

    } catch (err) {
        console.error('❌ ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
};

reset();
