import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { lineUserId, firstName, lastName, phone } = body;
        console.log(`[Registration] UID: ${lineUserId}, Phone: ${phone}`);

        if (!lineUserId || !firstName || !lastName || !phone) {
            return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
        }

        // Check if member already registered
        const existingMember = await Member.findOne({ lineUserId });
        if (existingMember && existingMember.isRegistered) {
            return NextResponse.json({ error: 'คุณลงทะเบียนไปแล้ว' }, { status: 400 });
        }

        // Update or Create
        const updatedMember = await Member.findOneAndUpdate(
            { lineUserId },
            {
                firstName,
                lastName,
                phone,
                isRegistered: true,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ', member: updatedMember });
    } catch (error: any) {
        console.error('Registration API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
