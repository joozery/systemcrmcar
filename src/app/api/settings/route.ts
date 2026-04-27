import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
    try {
        await connectDB();
        
        const defaults = [
            { key: 'point_earn_rate', value: 0.1, description: 'Points earned per 1 THB (Default: 0.1 = 10%)' },
            { key: 'point_min_redeem', value: 100, description: 'Minimum points required to redeem any service' },
            { key: 'tier_silver_threshold', value: 10000, description: 'ยอดสะสมเพื่อเป็นระดับ Silver' },
            { key: 'tier_gold_threshold', value: 30000, description: 'ยอดสะสมเพื่อเป็นระดับ Gold' },
            { key: 'tier_platinum_threshold', value: 100000, description: 'ยอดสะสมเพื่อเป็นระดับ Platinum' },
            { key: 'global_packages', value: [], description: 'แพ็กเกจรวมที่แสดงให้สมาชิกทุกคนเห็น' },
            { key: 'global_privileges', value: [], description: 'สิทธิพิเศษรวมที่แสดงให้สมาชิกทุกคนเห็น' }
        ];

        // Check each setting and insert if missing
        for (const def of defaults) {
            const existing = await Setting.findOne({ key: def.key });
            if (!existing) {
                await Setting.create(def);
            }
        }

        const settings = await Setting.find({});
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const { key, value } = await req.json();
        const setting = await Setting.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { new: true });
        return NextResponse.json(setting);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
