import mongoose, { Schema, model, models } from 'mongoose';

const ServiceSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    category: { type: String, default: 'อื่นๆ' }, // Keep for legacy/fallback
    description: { type: String },
    order: { type: Number, default: 0 },
    prices: {
        Bike: { type: Number, default: 0 },
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        X: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 }
    },
    pointCost: {
        Bike: { type: Number, default: 0 },
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        X: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 }
    },
    priceType: { type: String, enum: ['size', 'fixed'], default: 'size' },
    redeemable: { type: Boolean, default: false },
    duration: { type: String },
    maintenanceIntervalMonths: { type: Number, default: 0 }, // 0 = no reminder
    maintenanceIntervalUnit: { type: String, enum: ['days', 'months'], default: 'months' },
    maintenanceServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    status: { type: String, default: 'เปิดให้บริการ' },
    image: { type: String }
}, { timestamps: true });

const Service = models.Service || model('Service', ServiceSchema);

export default Service;
