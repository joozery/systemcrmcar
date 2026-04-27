import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';
import Service from '@/models/Service';
import { sendLinePushMessage } from '@/lib/line';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');
        const date = searchParams.get('date');
        
        const query: any = {};
        if (customerId) {
            // If it's a lineUserId, we need to find the MongoDB _id first
            if (customerId.startsWith('U') && customerId.length === 33) {
                const member = await Member.findOne({ lineUserId: customerId });
                if (member) {
                    query.customerId = member._id;
                } else {
                    // If member not found by lineId, return empty list
                    return NextResponse.json([]);
                }
            } else {
                query.customerId = customerId;
            }
        }
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.bookingDate = { $gte: start, $lte: end };
        }
        
        const bookings = await Booking.find(query)
            .populate('customerId', 'firstName lastName phone')
            .populate('serviceId', 'name category')
            .sort({ bookingDate: 1 });
        return NextResponse.json(bookings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { 
            customerId, serviceId, bookingDate, pickupDate, price, deposit,
            carPlate, carProvince, carBrand, carModel, carColor, carYear, carSize,
            notes, usePoints, bookingSource
        } = body;

        // Fetch point settings
        const settings = await require('@/models/Setting').default.find({});
        const earnRate = settings.find((s: any) => s.key === 'point_earn_rate')?.value || 0.1;

        const service = await Service.findById(serviceId);
        
        // Find member by ID or lineUserId
        let member;
        if (customerId.startsWith('U') && customerId.length === 33) {
            member = await Member.findOne({ lineUserId: customerId });
        } else {
            try {
                member = await Member.findById(customerId);
            } catch (e) {
                member = await Member.findOne({ lineUserId: customerId });
            }
        }

        if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

        let pointsEarned = 0;
        let pointsDeducted = 0;

        if (usePoints) {
            let pointCost = 0;
            if (service.priceType === 'fixed') {
                pointCost = service.pointCost?.S || 0;
            } else {
                pointCost = service.pointCost?.[carSize] || service.pointCost?.M || 0;
            }

            if (member.points < pointCost) {
                return NextResponse.json({ error: 'แต้มไม่เพียงพอสำหรับการแลกบริการนี้' }, { status: 400 });
            }
            pointsDeducted = pointCost;
        } else {
            pointsEarned = Math.floor(price * earnRate); // Points calculated on total price, but not awarded yet
        }

        const booking = await Booking.create({
            customerId: member._id,
            serviceId,
            carPlate,
            carProvince: carProvince || '-',
            carBrand: carBrand || '-',
            carModel: carModel || '-',
            carColor: carColor || '-',
            carYear: carYear || '-',
            carSize: carSize || 'M',
            bookingDate,
            pickupDate,
            price: usePoints ? 0 : price,
            deposit: deposit || 0,
            pointsEarned,
            notes: usePoints ? '(ใช้แต้มแลกบริการ) ' + (notes || '') : notes,
            status: 'รอดำเนินการ',
            bookingSource: bookingSource || 'offline'
        });

        // Update member: Handle REDEEM immediately, defer EARN, and auto-register car
        if (member) {
            const carExists = member.cars && member.cars.some((c: any) => c.plate === carPlate);
            const updateData: any = {
                $set: { lastServiceDate: new Date() }
            };

            // Only deduct points and add history if REDEEMING
            if (usePoints && pointsDeducted > 0) {
                updateData.$inc = { points: -pointsDeducted };
                updateData.$push = {
                    history: {
                        bookingId: booking._id,
                        date: new Date(),
                        points: -pointsDeducted,
                        type: 'REDEEM'
                    }
                };
            }

            // Auto-register car if not exists
            if (!carExists && carPlate) {
                if (!updateData.$push) updateData.$push = {};
                updateData.$push.cars = {
                    plate: carPlate,
                    brand: carBrand || '-',
                    model: carModel || '-',
                    province: carProvince || '-',
                    color: carColor || '-',
                    year: carYear || '-',
                    size: carSize || 'M'
                };
            }

            await Member.findByIdAndUpdate(member._id, updateData);
        }

        // Send LINE Push Notification
        if (member.lineUserId) {
            const dateObj = new Date(bookingDate);
            const formattedDate = dateObj.toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok'
            });
            const formattedTime = dateObj.toLocaleTimeString('th-TH', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
            }) + ' น.';
            
            const messageText = `🔔 ยืนยันการจองคิวรับบริการ\n\nสวัสดีคุณ ${member.firstName} 👋\nทางร้านได้รับคิวจองของคุณเรียบร้อยแล้ว\n\n📌 บริการ: ${service.name}\n🚘 ทะเบียนรถ: ${carPlate}\n📅 วันที่: ${formattedDate}\n⏰ เวลา: ${formattedTime}\n\nขอบคุณที่ไว้วางใจให้เราดูแลรถของคุณครับ 🙏`;

            await sendLinePushMessage(member.lineUserId, [
                {
                    type: 'text',
                    text: messageText
                }
            ]);
        }

        // Send LINE Notification to Admin
        const adminId = process.env.LINE_ADMIN_USER_ID;
        const groupId = process.env.LINE_GROUP_ID;
        
        if (adminId || groupId) {
            const dateObj = new Date(bookingDate);
            const formattedDate = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' });
            const formattedTime = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }) + ' น.';
            const adminMsg = `แอดมินครับ\n🆕 มีคิวจองใหม่เข้ามา! นะครับ\n\n👤 ลูกค้า: ${member.firstName} ${member.lastName}\n🚘 ทะเบียน: ${carPlate}\n🛠️ บริการ: ${service.name}\n📅 วันที่: ${formattedDate}\n⏰ เวลา: ${formattedTime}\n\nแอดมินเช็คด้วยนะครับ`;
            
            if (adminId) await sendLinePushMessage(adminId, [{ type: 'text', text: adminMsg }]);
            if (groupId) await sendLinePushMessage(groupId, [{ type: 'text', text: adminMsg }]);
        }

        return NextResponse.json(booking, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
