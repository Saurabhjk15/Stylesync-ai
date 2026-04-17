/**
 * Standalone Admin Creator
 * Run: node src/seeds/createAdmin.js
 * Creates admin@virtualmirror.ai in MongoDB
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const ADMIN = {
    name:     'VirtualMirror Admin',
    email:    'admin@virtualmirror.ai',
    password: 'Admin@VM2026!',
    role:     'admin',
    provider: 'local',
};

async function createAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
        console.log('✅ MongoDB connected');

        // Define minimal schema inline to avoid import issues
        const userSchema = new mongoose.Schema({
            name:          String,
            email:         { type: String, unique: true, lowercase: true },
            password:      { type: String, select: false },
            role:          { type: String, default: 'user' },
            provider:      { type: String, default: 'local' },
            googleId:      String,
            avatar:        String,
            loginAttempts: { type: Number, default: 0 },
            lockUntil:     Number,
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Check if admin already exists
        const existing = await User.findOne({ email: ADMIN.email });
        if (existing) {
            console.log('ℹ️  Admin already exists:', ADMIN.email);
            // Reset lockout just in case
            await User.updateOne({ email: ADMIN.email }, {
                $set:   { role: 'admin', loginAttempts: 0 },
                $unset: { lockUntil: '' },
            });
            console.log('✅ Admin verified and lockout cleared');
        } else {
            // Hash password manually (no middleware available)
            const salt           = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ADMIN.password, salt);

            await User.create({
                name:     ADMIN.name,
                email:    ADMIN.email,
                password: hashedPassword,
                role:     ADMIN.role,
                provider: ADMIN.provider,
            });
            console.log('✅ Admin created successfully!');
        }

        console.log('\n──────────────────────────────────');
        console.log('  Admin Credentials:');
        console.log('  Email:    admin@virtualmirror.ai');
        console.log('  Password: Admin@VM2026!');
        console.log('  Role:     admin');
        console.log('──────────────────────────────────\n');

    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
