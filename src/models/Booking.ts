import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    carPlate: String,
    carProvince: String,
    carBrand: String,
    carModel: String,
    carColor: String,
    carYear: String,
    carSize: String,
    bookingDate: { type: Date, required: true },
    pickupDate: Date,
    price: Number,
    deposit: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['รอดำเนินการ', 'ยืนยันแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'],
        default: 'รอดำเนินการ'
    },
    isNotified: { type: Boolean, default: false },
    bookingSource: { type: String, enum: ['online', 'offline'], default: 'offline' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
