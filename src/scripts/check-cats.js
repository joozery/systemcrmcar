const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function check() {
    const MONGODB_URI = process.env.MONGODB_URI;
    try {
        await mongoose.connect(MONGODB_URI);
        const Service = mongoose.models.Service || mongoose.model('Service', new mongoose.Schema({ category: String }));
        const cats = await Service.distinct('category');
        console.log('Distinct categories:', JSON.stringify(cats, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
