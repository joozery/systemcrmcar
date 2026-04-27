import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import Service from '@/models/Service';
import { sendLinePushMessage } from '@/lib/line';

export async function GET(req: NextRequest) {
    // Security check: optional simple secret check
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // In production, use process.env.CRON_SECRET
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        // Find members who need ANY kind of reminder
        const members = await Member.find({
            $or: [
                // 1. Need 7-day follow-up
                {
                    "cars": {
                        $elemMatch: {
                            lastMaintenanceDate: { $lte: sevenDaysAgo },
                            lastServiceFollowUpDate: { $eq: null }
                        }
                    }
                },
                // 2. Need 6-month maintenance reminder
                {
                    "cars": {
                        $elemMatch: {
                            nextMaintenanceDate: { $lte: now },
                            maintenanceCount: { $lt: 20 },
                            $or: [
                                { maintenanceReminderSentDate: { $exists: false } },
                                { maintenanceReminderSentDate: null },
                                { $expr: { $gt: ["$lastMaintenanceDate", "$maintenanceReminderSentDate"] } }
                            ]
                        }
                    }
                }
            ]
        });

        let sentCount = 0;

        for (const member of members) {
            if (!member.lineUserId) continue;

            let memberUpdated = false;
            for (let i = 0; i < member.cars.length; i++) {
                const car = member.cars[i];
                const lastMaint = car.lastMaintenanceDate ? new Date(car.lastMaintenanceDate) : null;
                const followUpSent = car.lastServiceFollowUpDate;
                const maintSentDate = car.maintenanceReminderSentDate ? new Date(car.maintenanceReminderSentDate) : new Date(0);
                const maintCount = car.maintenanceCount || 0;
                
                // --- 7-Day Follow-up Logic ---
                if (lastMaint && lastMaint <= sevenDaysAgo && !followUpSent) {
                    await sendLinePushMessage(member.lineUserId, [{
                        type: 'flex',
                        altText: '✨ ขอบคุณที่ใช้บริการ Pro Steam ครับ',
                        contents: {
                            type: 'bubble',
                            header: {
                                type: 'box', layout: 'vertical', backgroundColor: '#0ea5e9',
                                contents: [{ type: 'text', text: 'ขอบคุณที่ไว้ใจเรา 🙏', weight: 'bold', size: 'xl', color: '#ffffff' }]
                            },
                            body: {
                                type: 'box', layout: 'vertical', spacing: 'md',
                                contents: [
                                    { type: 'text', text: `สวัสดีครับคุณ ${member.firstName}`, weight: 'bold', size: 'md' },
                                    { type: 'text', text: `ผ่านไป 1 สัปดาห์แล้วหลังจากที่รถทะเบียน ${car.plate} เข้ารับบริการ หวังว่าคุณจะประทับใจในผลงานของเรานะครับ`, wrap: true, size: 'sm' },
                                    { type: 'text', text: `หากมีข้อสงสัยหรือต้องการสอบถามการดูแลรถเพิ่มเติม สามารถพิมพ์แชทหาแอดมินได้เลยครับ ✨`, wrap: true, size: 'xs', color: '#666666' }
                                ]
                            },
                            footer: {
                                type: 'box', layout: 'vertical',
                                contents: [{
                                    type: 'button', style: 'link', height: 'sm',
                                    action: { type: 'uri', label: 'สอบถามแอดมิน', uri: 'https://line.me/ti/p/@prosteam' }
                                }]
                            }
                        }
                    }]);
                    
                    member.cars[i].lastServiceFollowUpDate = new Date();
                    memberUpdated = true;
                    sentCount++;
                }

                // --- 6-Month Maintenance Logic ---
                const isMaintDue = car.nextMaintenanceDate && new Date(car.nextMaintenanceDate) <= now;
                const needsMaintReminder = (lastMaint && lastMaint > maintSentDate) || !car.maintenanceReminderSentDate;

                if (isMaintDue && needsMaintReminder && maintCount < 20) {
                    const serviceId = car.maintenanceServiceId;
                    const service = await Service.findById(serviceId);
                    const serviceName = service ? service.name : "ตรวจเช็คระยะ (Maintenance)";
                    
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://systemcar.wooyouspace.space';
                    const bookingUrl = `${baseUrl}/booking?id=${member.lineUserId}&service=${serviceId || ''}`;

                    await sendLinePushMessage(member.lineUserId, [{
                        type: 'flex',
                        altText: `🔔 แจ้งเตือน: ถึงเวลาดูแลรถทะเบียน ${car.plate} แล้วครับ`,
                        contents: {
                            type: 'bubble',
                            header: {
                                type: 'box', layout: 'vertical', backgroundColor: '#2563eb',
                                contents: [{ type: 'text', text: 'ถึงเวลาตรวจเช็คระยะ 🛠️', weight: 'bold', size: 'xl', color: '#ffffff' }]
                            },
                            body: {
                                type: 'box', layout: 'vertical', spacing: 'md',
                                contents: [
                                    { type: 'text', text: `สวัสดีครับคุณ ${member.firstName}`, weight: 'bold', size: 'md' },
                                    { type: 'text', text: `รถทะเบียน ${car.plate} ครบรอบบริการ ${serviceName} แล้วครับ (รอบที่ ${maintCount + 1}/20)`, wrap: true, size: 'sm' },
                                    {
                                        type: 'box', layout: 'vertical', backgroundColor: '#eff6ff', paddingAll: 'md', cornerRadius: 'md',
                                        contents: [{ type: 'text', text: '✨ สิทธิพิเศษ: จองคิวล่วงหน้าเพื่อรับบริการที่รวดเร็วที่สุดได้เลยครับ', size: 'xs', color: '#1e40af', weight: 'bold', wrap: true }]
                                    }
                                ]
                            },
                            footer: {
                                type: 'box', layout: 'vertical', spacing: 'sm',
                                contents: [
                                    {
                                        type: 'button', style: 'primary', color: '#2563eb', height: 'sm',
                                        action: { type: 'uri', label: 'จองคิวรับบริการ', uri: bookingUrl }
                                    },
                                    {
                                        type: 'button', style: 'link', height: 'sm',
                                        action: { type: 'uri', label: 'สอบถามแอดมิน', uri: 'https://line.me/ti/p/@prosteam' }
                                    }
                                ]
                            }
                        }
                    }]);

                    member.cars[i].maintenanceReminderSentDate = new Date();
                    member.cars[i].maintenanceCount = (member.cars[i].maintenanceCount || 0) + 1;
                    memberUpdated = true;
                    sentCount++;
                }
            }
            if (memberUpdated) {
                await member.save();
            }
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (error: any) {
        console.error("Cron Reminder Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
