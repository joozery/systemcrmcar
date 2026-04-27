import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: String,
    role: { type: String, enum: ['admin', 'staff', 'sale'], default: 'staff' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
