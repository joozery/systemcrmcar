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
        year: String,
        color: String,
        province: String,
        size: String,
        lastMaintenanceDate: Date,
        nextMaintenanceDate: Date,
        maintenanceReminderSentDate: Date,
        lastServiceFollowUpDate: Date,
        maintenanceCount: { type: Number, default: 0 },
        maintenanceServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }
    }],
    packages: [{
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        name: String,
        totalWashes: Number,
        remainingWashes: Number,
        purchaseDate: { type: Date, default: Date.now },
        expiryDate: Date,
        status: { type: String, default: 'active' }
    }],
    totalSpent: { type: Number, default: 0 },
    lastServiceDate: Date,
    nextServiceDate: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
