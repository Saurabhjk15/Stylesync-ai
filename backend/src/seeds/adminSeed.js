/**
 * Admin Seed
 * ==========
 * Creates and guarantees the admin super-user on startup.
 * Called automatically from server.js after MongoDB connects.
 *
 * Admin credentials:
 *   Email:    admin@virtualmirror.ai
 *   Password: Admin@VM2026!
 *   Role:     admin
 */

import User from '../models/User.js';

const ADMIN = {
    name:     'VirtualMirror Admin',
    email:    'admin@virtualmirror.ai',
    password: 'Admin@VM2026!',
    role:     'admin',
    provider: 'local',
};

export async function seedAdmin() {
    try {
        const existing = await User.findOne({ email: ADMIN.email });

        if (existing) {
            // Ensure role is still admin (safety check)
            if (existing.role !== 'admin') {
                existing.role = 'admin';
                await existing.save();
                console.log('🔧 Admin role restored for', ADMIN.email);
            }
            // Reset any lockout that might have happened
            if (existing.lockUntil || existing.loginAttempts > 0) {
                existing.loginAttempts = 0;
                existing.lockUntil    = undefined;
                await existing.save();
                console.log('🔓 Admin lockout cleared');
            }
            console.log('✅ Admin user verified:', ADMIN.email);
            return;
        }

        await User.create(ADMIN);
        console.log('✅ Admin user created:', ADMIN.email);
    } catch (err) {
        console.error('❌ Admin seed failed:', err.message);
    }
}
