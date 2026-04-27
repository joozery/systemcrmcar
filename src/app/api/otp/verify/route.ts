import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { phone, pin } = await req.json();
        if (!phone || !pin) return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });

        console.log(`[OTP Verify] Attempt: Phone=${phone}, PIN=${pin}`);

        // Find latest valid OTP for this phone
        const otpRecord = await OTP.findOne({
            phone,
            code: pin,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            console.log(`[OTP Verify] Failed: No valid record found for ${phone} with PIN ${pin}`);
            return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' }, { status: 400 });
        }

        console.log(`[OTP Verify] Success: Found record for ${phone}`);

        // Mark as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        return NextResponse.json({ success: true, message: 'ยืนยันรหัสสำเร็จ' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
