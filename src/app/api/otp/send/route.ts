import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { phone } = await req.json();
        if (!phone) return NextResponse.json({ error: 'กรุณาระบุเบอร์โทรศัพท์' }, { status: 400 });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const refCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        // Save to DB
        await OTP.create({
            phone,
            code: otp,
            refCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        });

        const sepsmsToken = process.env.SEPSMS_TOKEN;
        const sender = process.env.SMS_SENDER || 'OTP';

        // Format phone to 66 format if starts with 0
        let formattedPhone = phone;
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '66' + formattedPhone.substring(1);
        }

        console.log(`[OTP Send] Target Phone: ${phone} -> Formatted: ${formattedPhone}`);

        // Send via Sepsms API
        const response = await fetch('https://api.sepsms.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sepsmsToken}`
            },
            body: JSON.stringify({
                msisdn: formattedPhone,
                content: `รหัส OTP ของคุณคือ ${otp} (Ref: ${refCode})`,
                sender: sender
            })
        });

        const data = await response.json();
        console.log('Sepsms Response:', data);

        if (!response.ok) {
            return NextResponse.json({ 
                error: `Sepsms: ${data.message || 'เกิดข้อผิดพลาดในการส่ง SMS'}` 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            refCode: refCode,
            message: 'ส่งรหัส OTP เรียบร้อยแล้ว'
        });
    } catch (error: any) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
