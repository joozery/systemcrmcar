import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    icon: { type: String }, // For visual identity
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = models.Category || model('Category', CategorySchema);

export default Category;
