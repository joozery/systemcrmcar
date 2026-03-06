import mongoose, { Schema, model, models } from 'mongoose';

const ServiceSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'อื่นๆ' },
    description: { type: String },
    prices: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 }
    },
    pointCost: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 }
    },
    redeemable: { type: Boolean, default: false },
    duration: { type: String },
    status: { type: String, default: 'เปิดให้บริการ' },
    image: { type: String }
}, { timestamps: true });

const Service = models.Service || model('Service', ServiceSchema);

export default Service;
