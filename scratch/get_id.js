import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb.js';
import Member from './src/models/Member.js';

async function getSampleId() {
    await connectDB();
    const member = await Member.findOne({ isRegistered: true });
    if (member) {
        console.log('ID:', member._id.toString());
        console.log('Name:', member.firstName, member.lastName);
    } else {
        console.log('No registered member found');
    }
    process.exit(0);
}

getSampleId();
