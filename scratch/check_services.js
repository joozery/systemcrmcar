const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const ServiceSchema = new mongoose.Schema({
    name: String,
    price: Object,
    pointCost: Object,
    duration: Number,
    image: String,
    redeemable: { type: Boolean, default: false }
});

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

async function checkServices() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found');
        return;
    }
    try {
        await mongoose.connect(MONGODB_URI);
        const services = await Service.find({});
        console.log(JSON.stringify(services, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkServices();
