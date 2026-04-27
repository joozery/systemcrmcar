const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingDate: Date,
    status: String
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

async function check() {
    const uri = "mongodb+srv://flowerandsunskycottiebaby_db_user:XUmM6sHEO2Ia5EDE@systemcar.ilkosa9.mongodb.net/systemcar?retryWrites=true&w=majority&appName=systemcar";
    await mongoose.connect(uri);
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(JSON.stringify(bookings, null, 2));
    process.exit(0);
}

check();
