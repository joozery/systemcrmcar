import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    amount: { type: Number, required: true },
    method: {
        type: String,
        enum: ['เงินสด', 'โอนเงิน', 'คูปอง/คะแนน'],
        default: 'โอนเงิน'
    },
    status: {
        type: String,
        enum: ['ค้างชำระ', 'ชำระแล้ว', 'ยกเลิก'],
        default: 'ชำระแล้ว'
    },
    slipImageUrl: String,
    paidAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
