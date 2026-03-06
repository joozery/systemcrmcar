import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';

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
        ).populate('customerId');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // If status changes to 'เสร็จสิ้น' (Finished), send a LINE notification
        if (status === 'เสร็จสิ้น' && booking.customerId && booking.customerId.lineUserId) {
            await sendLineNotification(booking.customerId.lineUserId, booking);
        }

        return NextResponse.json(booking);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function sendLineNotification(lineUserId: string, booking: any) {
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!LINE_ACCESS_TOKEN) return;

    try {
        const message = {
            to: lineUserId,
            messages: [
                {
                    type: 'flex',
                    altText: 'รถของคุณพร้อมส่งมอบแล้ว! 🚗',
                    contents: {
                        type: 'bubble',
                        header: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'รถของคุณพร้อมแล้ว!',
                                    weight: 'bold',
                                    size: 'xl',
                                    color: '#000000'
                                }
                            ],
                            backgroundColor: '#bbfc2f'
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: `สวัสดีครับคุณ ${booking.customerId.firstName} รถทะเบียน ${booking.carPlate} ของคุณดำเนินการ ${booking.serviceId?.name || 'บริการ'} เสร็จเรียบร้อยแล้วครับ`,
                                    wrap: true,
                                    size: 'sm'
                                },
                                {
                                    type: 'separator',
                                    margin: 'md'
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'md',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: 'เชิญรับรถได้ที่ร้านเลยครับ 🙏',
                                            size: 'sm',
                                            color: '#666666'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        };

        await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
            },
            body: JSON.stringify(message)
        });

    } catch (error) {
        console.error('Failed to send LINE notification:', error);
    }
}
