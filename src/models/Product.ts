import mongoose, { Schema, model, models } from 'mongoose';

const MovementSchema = new Schema({
    date: { type: String, required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    user: { type: String, default: 'Admin' }
}, { timestamps: true });

const ProductSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'อื่นๆ' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'ชิ้น' },
    status: { type: String, default: 'ปกติ' },
    lastUpdated: { type: String },
    image: { type: String },
    description: { type: String },
    price: { type: Number, default: 0 },
    minAlert: { type: Number, default: 5 },
    supplier: { type: String },
    movements: [MovementSchema]
}, { timestamps: true });

const Product = models.Product || model('Product', ProductSchema);

export default Product;
