import connectDB from './src/lib/mongodb';
import Booking from './src/models/Booking';
import Member from './src/models/Member';

async function check() {
    await connectDB();
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5).populate('customerId');
    console.log(JSON.stringify(bookings, null, 2));
    process.exit(0);
}

check();
