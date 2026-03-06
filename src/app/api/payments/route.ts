import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';

export async function GET() {
    try {
        await connectDB();
        const payments = await Payment.find({})
            .populate('customerId', 'firstName lastName phone')
            .populate('bookingId', 'carPlate bookingDate status')
            .sort({ createdAt: -1 });
        return NextResponse.json(payments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const payment = await Payment.create(body);
        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
