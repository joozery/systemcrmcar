import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }

        // Check status
        if (user.status === 'inactive') {
            return NextResponse.json({ error: 'บัญชีนี้ถูกระงับการเข้าถึง กรุณาติดต่อผู้ออกแบบระบบ' }, { status: 403 });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }

        // Create session
        await login(user._id.toString(), user.username, user.role);

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return NextResponse.json({
            success: true,
            user: {
                username: user.username,
                firstName: user.firstName,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
    }
}
