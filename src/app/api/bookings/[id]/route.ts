import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';
import Service from '@/models/Service';
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

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).populate('customerId').populate('serviceId');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const lineUserId = booking.customerId?.lineUserId;
        const customerName = booking.customerId?.firstName || 'ลูกค้า';
        const carPlate = booking.carPlate || '';
        const serviceName = booking.serviceId?.name || 'บริการคาร์ดีเทลลิ่ง';

        let formattedPickup = '-';
        if (booking.pickupDate) {
            formattedPickup = new Date(booking.pickupDate).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
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
                            backgroundColor: '#bbfc2f' // Brand Green
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
