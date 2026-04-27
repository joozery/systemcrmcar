import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Service from '@/models/Service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const category = await Category.findById(params.id);
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        
        // Check if there are services in this category
        const serviceCount = await Service.countDocuments({ categoryId: params.id });
        if (serviceCount > 0) {
            return NextResponse.json({ error: 'Cannot delete category with active services' }, { status: 400 });
        }

        await Category.findByIdAndDelete(params.id);
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
