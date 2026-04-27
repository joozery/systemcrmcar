import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        console.log(`[Customer Fetch] ID: ${id}`);
        
        // Try finding by MongoDB ID first, then by lineUserId
        let customer;
        if (id.startsWith('U') && id.length === 33) {
            // Likely a LINE User ID
            customer = await Member.findOne({ lineUserId: id });
        } else {
            try {
                customer = await Member.findById(id);
            } catch (e) {
                // If not a valid ObjectId, try as lineUserId anyway
                customer = await Member.findOne({ lineUserId: id });
            }
        }

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        // Include any car updates or service dates
        const customer = await Member.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const customer = await Member.findByIdAndDelete(id);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
