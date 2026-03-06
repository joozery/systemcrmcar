import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';
import Service from '@/models/Service';
import { sendLinePushMessage } from '@/lib/line';

export async function GET() {
    try {
        await connectDB();
        const bookings = await Booking.find({})
            .populate('customerId', 'firstName lastName phone')
            .populate('serviceId', 'name')
            .sort({ bookingDate: -1 });
        return NextResponse.json(bookings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { customerId, serviceId, bookingDate, pickupDate, price, carPlate, carSize, notes, usePoints } = body;

        // Fetch point settings
        const settings = await require('@/models/Setting').default.find({});
        const earnRate = settings.find((s: any) => s.key === 'point_earn_rate')?.value || 0.1;

        const service = await Service.findById(serviceId);
        const member = await Member.findById(customerId);

        if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

        let pointsEarned = 0;
        let pointsDeducted = 0;

        if (usePoints) {
            const pointCost = service.pointCost[carSize] || 0;
            if (member.points < pointCost) {
                return NextResponse.json({ error: 'แต้มไม่เพียงพอสำหรับการแลกบริการนี้' }, { status: 400 });
            }
            pointsDeducted = pointCost;
        } else {
            pointsEarned = Math.floor(price * earnRate);
        }

        const booking = await Booking.create({
            customerId,
            serviceId,
            carPlate,
            carSize,
            bookingDate,
            pickupDate,
            price: usePoints ? 0 : price, // If using points, price is effectively 0
            pointsEarned,
            notes: usePoints ? '(ใช้แต้มแลกบริการ) ' + (notes || '') : notes,
            status: 'รอดำเนินการ'
        });

        // Update member points and history
        await Member.findByIdAndUpdate(customerId, {
            $inc: { points: pointsEarned - pointsDeducted },
            $set: { lastServiceDate: new Date() },
            $push: {
                history: {
                    bookingId: booking._id,
                    date: new Date(),
                    points: usePoints ? -pointsDeducted : pointsEarned,
                    type: usePoints ? 'REDEEM' : 'EARN'
                }
            }
        });

        // Send LINE Push Notification
        if (member.lineUserId) {
            const formattedDate = new Date(bookingDate).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const messageText = `🔔 ยืนยันการจองคิวรับบริการ\n\nสวัสดีคุณ ${member.firstName} 👋\nทางร้านได้รับคิวจองของคุณเรียบร้อยแล้ว\n\n📌 บริการ: ${service.name}\n🚘 ทะเบียนรถ: ${carPlate}\n📅 วันที่นัดหมาย: ${formattedDate}\n\nขอบคุณที่ไว้วางใจให้เราดูแลรถของคุณครับ 🙏`;

            await sendLinePushMessage(member.lineUserId, [
                {
                    type: 'text',
                    text: messageText
                }
            ]);
        }

        return NextResponse.json(booking, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
