import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';
import Service from '@/models/Service';
import Payment from '@/models/Payment';
import { sendLinePushMessage } from '@/lib/line';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        const oldBooking = await Booking.findById(id);
        if (!oldBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('customerId').populate('serviceId');

        if (status === 'เสร็จสิ้น' && oldBooking.status !== 'เสร็จสิ้น' && booking.customerId) {
            // Award points and update total spent
            const pointsToAward = oldBooking.pointsEarned || 0;
            
            await Member.findByIdAndUpdate(booking.customerId._id, {
                $inc: { 
                    totalSpent: booking.price || 0,
                    points: pointsToAward
                },
                ...(pointsToAward > 0 && {
                    $push: {
                        history: {
                            bookingId: id,
                            date: new Date(),
                            points: pointsToAward,
                            type: 'EARN'
                        }
                    }
                })
            });

            // Create Payment record (Record Sale)
            await Payment.create({
                bookingId: id,
                customerId: booking.customerId._id,
                amount: booking.price || 0,
                method: 'โอนเงิน', // Default
                status: 'ชำระแล้ว',
                paidAt: new Date()
            });

            // Update maintenance and service dates for the specific car
            const service = booking.serviceId;
            let nextMaintenanceDate = null;
            
            if (service && service.maintenanceIntervalMonths > 0) {
                const now = new Date();
                if (service.maintenanceIntervalUnit === 'days') {
                    // Calculate next maintenance date in DAYS
                    nextMaintenanceDate = new Date(now.setDate(now.getDate() + service.maintenanceIntervalMonths));
                } else {
                    // Calculate next maintenance date in MONTHS (default)
                    nextMaintenanceDate = new Date(now.setMonth(now.getMonth() + service.maintenanceIntervalMonths));
                }
            }
            
            // Deduct from package if applicable
            const member = await Member.findById(booking.customerId._id);
            if (member && member.packages && member.packages.length > 0) {
                const packageIndex = member.packages.findIndex((p: any) => 
                    p.serviceId?.toString() === service?._id?.toString() && 
                    p.remainingWashes > 0 && 
                    p.status === 'active'
                );
                
                if (packageIndex !== -1) {
                    member.packages[packageIndex].remainingWashes -= 1;
                    if (member.packages[packageIndex].remainingWashes === 0) {
                        member.packages[packageIndex].status = 'completed';
                    }
                }
            }

            // Update car info
            await Member.updateOne(
                { _id: booking.customerId._id, "cars.plate": booking.carPlate },
                { 
                    $set: { 
                        "cars.$.lastMaintenanceDate": new Date(),
                        "cars.$.lastServiceFollowUpDate": null, // Reset for new 7-day reminder
                        ...(nextMaintenanceDate && { "cars.$.nextMaintenanceDate": nextMaintenanceDate }),
                        ...(service && { "cars.$.maintenanceServiceId": service.maintenanceServiceId || service._id })
                    },
                    ...(member?.packages && { packages: member.packages })
                }
            );
        }

        const lineUserId = booking.customerId?.lineUserId;
        const customerName = booking.customerId?.firstName || 'ลูกค้า';
        const carPlate = booking.carPlate || '';
        const serviceName = booking.serviceId?.name || 'บริการคาร์ดีเทลลิ่ง';

        let formattedPickup = '-';
        if (booking.pickupDate) {
            formattedPickup = new Date(booking.pickupDate).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'
            });
        }

        if (lineUserId) {
            if (status === 'กำลังดำเนินการ') {
                await sendLinePushMessage(lineUserId, [{
                    type: 'flex',
                    altText: 'อัปเดตสถานะรถของคุณ: กำลังดำเนินการ 🛠️',
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [{ type: 'text', text: 'กำลังเริ่มงาน 🛠️', weight: 'bold', size: 'xl', color: '#ffffff' }],
                            backgroundColor: '#f97316' // Orange
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                { type: 'text', text: `สวัสดีครับคุณ ${customerName}`, size: 'sm', margin: 'md' },
                                { type: 'text', text: `รถทะเบียน ${carPlate} ของคุณกำลังเริ่มดำเนินการ ${serviceName} แล้วครับ ทีมช่างกำลังดูแลอย่างเต็มที่!`, wrap: true, size: 'sm', margin: 'md' },
                                { type: 'separator', margin: 'lg' },
                                {
                                    type: 'box', layout: 'vertical', margin: 'md', contents: [
                                        { type: 'text', text: `กำหนดรับรถโดยประมาณ:`, size: 'xs', color: '#aaaaaa' },
                                        { type: 'text', text: formattedPickup, size: 'sm', weight: 'bold', color: '#f97316' }
                                    ]
                                }
                            ]
                        }
                    }
                }]);
            } else if (status === 'ยืนยันแล้ว') {
                await sendLinePushMessage(lineUserId, [{
                    type: 'flex',
                    altText: 'การจองคิวของคุณได้รับการอนุมัติแล้ว ✅',
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [{ type: 'text', text: 'อนุมัติการจองแล้ว ✅', weight: 'bold', size: 'xl', color: '#ffffff' }],
                            backgroundColor: '#4f46e5' // Indigo
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                { type: 'text', text: `สวัสดีครับคุณ ${customerName}`, size: 'sm', margin: 'md' },
                                { type: 'text', text: `คิวจองบริการ ${serviceName} ของคุณได้รับการยืนยันเรียบร้อยแล้วครับ กรุณานำรถเข้ามาตามวันและเวลาที่นัดหมาย`, wrap: true, size: 'sm', margin: 'md' },
                                { type: 'separator', margin: 'lg' },
                                {
                                    type: 'box', layout: 'vertical', margin: 'md', contents: [
                                        { type: 'text', text: `วันนัดหมาย:`, size: 'xs', color: '#aaaaaa' },
                                        { type: 'text', text: new Date(booking.bookingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' }), size: 'sm', weight: 'bold', color: '#4f46e5' }
                                    ]
                                }
                            ]
                        }
                    }
                }]);
            } else if (status === 'ยกเลิก') {
                await sendLinePushMessage(lineUserId, [{
                    type: 'flex',
                    altText: 'การจองคิวของคุณถูกยกเลิก ❌',
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [{ type: 'text', text: 'ยกเลิกการจอง ❌', weight: 'bold', size: 'xl', color: '#ffffff' }],
                            backgroundColor: '#ef4444' // Red
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                { type: 'text', text: `สวัสดีครับคุณ ${customerName}`, size: 'sm', margin: 'md' },
                                { type: 'text', text: `ขออภัยครับ คิวจองบริการ ${serviceName} สำหรับรถทะเบียน ${carPlate} ของคุณได้ถูกยกเลิกแล้ว`, wrap: true, size: 'sm', margin: 'md' },
                                { type: 'text', text: `หากมีข้อสงสัยสามารถสอบถามผ่าน LINE ได้ทันทีครับ 🙏`, size: 'xs', color: '#666666', margin: 'md' }
                            ]
                        }
                    }
                }]);
            } else if (status === 'เสร็จสิ้น') {
                await sendLinePushMessage(lineUserId, [{
                    type: 'flex',
                    altText: 'รถของคุณเสร็จเรียบร้อยแล้ว! ✨',
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [{ type: 'text', text: 'รถพร้อมรับแล้ว! ✨', weight: 'bold', size: 'xl', color: '#000000' }],
                            backgroundColor: '#2563eb' // Brand Green
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                { type: 'text', text: `สวัสดีครับคุณ ${customerName}`, size: 'sm', margin: 'md' },
                                { type: 'text', text: `รถทะเบียน ${carPlate} ดำเนินการ ${serviceName} เสร็จเรียบร้อยแล้วครับ ✨เงาวับพร้อมใช้งาน!`, wrap: true, size: 'sm', margin: 'md' },
                                { type: 'separator', margin: 'lg' },
                                {
                                    type: 'box', layout: 'vertical', margin: 'md', contents: [
                                        { type: 'text', text: 'มารับรถได้เลยครับ ขอบคุณที่ใช้บริการ 🙏', size: 'sm', color: '#666666' }
                                    ]
                                }
                            ]
                        }
                    }
                }]);
            }
        }

        return NextResponse.json(booking);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
