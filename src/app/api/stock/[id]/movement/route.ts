import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json(); // { type: 'IN' | 'OUT', amount: number, note: string, user: string }

        const product = await Product.findOne({ id });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const newQuantity = body.type === 'IN'
            ? product.quantity + body.amount
            : Math.max(0, product.quantity - body.amount);

        const now = new Date();
        const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const lastUpdated = `${now.getDate().toString().padStart(2, '0')} ${thMonths[now.getMonth()]} ${now.getFullYear() + 543}`;

        product.quantity = newQuantity;
        product.lastUpdated = lastUpdated;
        product.status = newQuantity === 0 ? "หมดสต็อก" : newQuantity < product.minAlert ? "ใกล้หมด" : "ปกติ";

        product.movements.unshift({
            date: `${lastUpdated} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            type: body.type,
            amount: body.amount,
            note: body.note,
            user: body.user || 'Admin'
        });

        await product.save();

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
