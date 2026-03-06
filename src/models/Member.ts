import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
    lineUserId: { type: String, required: true, unique: true },
    displayName: String,
    pictureUrl: String,
    firstName: String,
    lastName: String,
    phone: String,
    points: { type: Number, default: 0 },
    coupons: [{
        code: String,
        name: String,
        expiryDate: Date,
        isUsed: { type: Boolean, default: false }
    }],
    isRegistered: { type: Boolean, default: false },
    cars: [{
        plate: String,
        brand: String,
        model: String,
        color: String,
        size: String,
    }],
    lastServiceDate: Date,
    nextServiceDate: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
