import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
    try {
        await connectDB();
        const settings = await Setting.find({});
        // If no settings exist, create defaults
        if (settings.length === 0) {
            const defaults = [
                { key: 'point_earn_rate', value: 0.1, description: 'Points earned per 1 THB (Default: 0.1 = 10%)' },
                { key: 'point_min_redeem', value: 100, description: 'Minimum points required to redeem any service' }
            ];
            await Setting.insertMany(defaults);
            return NextResponse.json(defaults);
        }
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
