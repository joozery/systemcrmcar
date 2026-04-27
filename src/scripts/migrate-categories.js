const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function migrate() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const CategorySchema = new mongoose.Schema({
            name: String,
            order: Number,
            isActive: Boolean
        }, { timestamps: true });

        const ServiceSchema = new mongoose.Schema({
            name: String,
            category: String,
            categoryId: mongoose.Schema.Types.ObjectId
        });

        const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
        const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

        const initialCategories = [
            "ล้างรถ",
            "เคลือบเซรามิก",
            "ฟิล์มใสกันรอย",
            "ฟิล์มกรองแสง",
            "พ่นกันสนิม",
            "Wrap / สติกเกอร์",
            "ตรวจเช็ค/ดูแลตามระยะ ทุก 6 เดือน",
            "อื่นๆ"
        ];

        const mapping = {
            "ล้างรถและทำความสะอาด": "ล้างรถ",
            "ตรวจเช็ค/ดูแลตามระยะ ทุก 6 เดือน": "ตรวจเช็ค/ดูแลตามระยะ ทุก 6 เดือน"
        };

        for (let i = 0; i < initialCategories.length; i++) {
            const catName = initialCategories[i];
            let cat = await Category.findOne({ name: catName });
            
            if (!cat) {
                cat = await Category.create({
                    name: catName,
                    order: i,
                    isActive: true
                });
                console.log(`Created category: ${catName}`);
            }

            // Update services for this specific category or its mapped old names
            const oldNames = Object.keys(mapping).filter(k => mapping[k] === catName);
            const searchNames = [catName, ...oldNames];

            const result = await Service.updateMany(
                { category: { $in: searchNames } },
                { $set: { categoryId: cat._id } }
            );
            console.log(`Updated ${result.modifiedCount} services for category: ${catName}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
