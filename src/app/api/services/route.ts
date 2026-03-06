import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { uploadImage } from '@/lib/cloudinary';

export async function GET() {
    try {
        await connectDB();
        const services = await Service.find({}).sort({ createdAt: -1 });
        return NextResponse.json(services);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        let imageUrl = body.image;
        if (imageUrl && imageUrl.startsWith('data:image')) {
            imageUrl = await uploadImage(imageUrl);
        }

        const service = await Service.create({
            ...body,
            image: imageUrl
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
