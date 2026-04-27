import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import Service from '@/models/Service';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { memberId, serviceId, size } = await req.json();

        const member = await Member.findById(memberId);
        if (!member) return NextResponse.json({ error: 'ไม่พบข้อมูลสมาชิก' }, { status: 404 });

        const service = await Service.findById(serviceId);
        if (!service) return NextResponse.json({ error: 'ไม่พบรายการบริการ' }, { status: 404 });

        const pts = service.priceType === 'fixed' 
            ? (service.pointCost?.S || 0)
            : (service.pointCost?.[size] || 0);

        if (member.points < pts) {
            return NextResponse.json({ error: 'แต้มสะสมไม่เพียงพอ' }, { status: 400 });
        }

        // Deduct points and add coupon
        member.points -= pts;
        
        const newCoupon = {
            name: `รางวัล: ${service.name}`,
            code: `RD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
            isUsed: false
        };

        member.coupons.push(newCoupon);
        await member.save();

        return NextResponse.json({ 
            message: 'แลกรางวัลสำเร็จ!', 
            coupon: newCoupon,
            remainingPoints: member.points 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
