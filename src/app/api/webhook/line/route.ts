import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const events = body.events || [];

        for (const event of events) {
            if (event.source.type === 'group') {
                console.log('--- LINE GROUP ID FOUND ---');
                console.log('Group ID:', event.source.groupId);
                console.log('Message:', event.message?.text);
                console.log('---------------------------');
            } else if (event.source.type === 'user') {
                console.log('--- LINE USER ID FOUND ---');
                console.log('User ID:', event.source.userId);
                console.log('---------------------------');
            }

            if (event.type === 'follow') {
                const userId = event.source.userId;
                const replyToken = event.replyToken;

                await connectDB();

                // Find existing or create placeholder
                let member = await Member.findOne({ lineUserId: userId });
                if (!member) {
                    member = new Member({
                        lineUserId: userId,
                        isRegistered: false
                    });
                    await member.save();
                }

                // Send Welcome Message with Registration Link
                // Replace with your actual deployment URL later
                const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/register-member?uid=${userId}`;

                await sendLineReply(replyToken, [
                    {
                        type: 'text',
                        text: 'ยินดีต้อนรับสู่ระบบสมาชิกของเรา! 🎉\nกรุณากดที่ลิงก์ด้านล่างเพื่อลงทะเบียนและเริ่มสะสมแต้มรับคูปองส่วนลดนะครับ'
                    },
                    {
                        type: 'text',
                        text: registrationUrl
                    }
                ]);
            }
        }

        return NextResponse.json({ message: 'OK' });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function sendLineReply(replyToken: string, messages: any[]) {
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!LINE_ACCESS_TOKEN) {
        console.error('Missing LINE_CHANNEL_ACCESS_TOKEN');
        return;
    }

    await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            replyToken,
            messages
        })
    });
}
