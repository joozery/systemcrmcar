import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Member from '@/models/Member';
import Payment from '@/models/Payment';
import Service from '@/models/Service';
import Product from '@/models/Product';

export async function GET() {
    try {
        await connectDB();

        const totalMembers = await Member.countDocuments({ isRegistered: true });
        const totalBookings = await Booking.countDocuments();

        // Count new members this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newMembersThisMonth = await Member.countDocuments({
            isRegistered: true,
            createdAt: { $gte: startOfMonth }
        });

        // Sum up total revenue
        const payments = await Payment.find({});
        const totalRevenue = payments
            .filter(p => p.status === 'ชำระแล้ว')
            .reduce((acc, p) => acc + (p.amount || 0), 0);

        const pendingRevenue = payments
            .filter(p => p.status === 'ค้างชำระ')
            .reduce((acc, p) => acc + (p.amount || 0), 0);

        // Count active bookings (not 'เสร็จสิ้น')
        const activeBookings = await Booking.countDocuments({ status: { $ne: 'เสร็จสิ้น' } });

        // Low stock count
        const products = await Product.find({});
        const lowStockCount = products.filter(p => p.quantity <= (p.minAlert || 5)).length;

        // Today metrics
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayBookings = await Booking.find({
            bookingDate: { $gte: startOfToday, $lte: endOfToday }
        });
        const todayCount = todayBookings.length;
        const todayCompletedCount = todayBookings.filter(b => b.status === 'เสร็จสิ้น').length;
        const completionRate = todayCount > 0 ? Math.round((todayCompletedCount / todayCount) * 100) : 0;

        // Get the last 6 months list
        const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push({
                month: d.getMonth() + 1,
                name: monthNames[d.getMonth()],
                total: 0
            });
        }

        // Aggregate monthly revenue
        const monthlyData = await Payment.aggregate([
            { $match: { status: 'ชำระแล้ว' } },
            {
                $group: {
                    _id: { month: { $month: "$paidAt" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        // Merge actual data into the 6 months list
        const formattedMonthlyData = last6Months.map(m => {
            const found = monthlyData.find(d => d._id.month === m.month);
            return {
                name: m.name,
                total: found ? found.total : 0
            };
        });

        // Get recent bookings for the list
        const recentBookings = await Booking.find({})
            .populate('customerId', 'firstName lastName')
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get counts for StatsRow by searching service names
        const allPendingBookings = await Booking.find({ status: { $ne: 'เสร็จสิ้น' } }).populate('serviceId', 'name');

        const washCount = allPendingBookings.filter((b: any) => b.serviceId?.name?.includes('ล้าง')).length;
        const ceramicCount = allPendingBookings.filter((b: any) => b.serviceId?.name?.includes('เซรามิก')).length;
        const ppfCount = allPendingBookings.filter((b: any) => b.serviceId?.name?.includes('PPF') || b.serviceId?.name?.includes('ฟิล์ม')).length;
        const readyCount = await Booking.countDocuments({ status: 'เสร็จสิ้น', updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }); // Today finished

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalBookings,
                totalMembers,
                activeBookings
            },
            categoryStats: {
                wash: washCount,
                ceramic: ceramicCount,
                ppf: ppfCount,
                ready: readyCount
            },
            extraStats: {
                newMembers: newMembersThisMonth,
                pendingRevenue,
                lowStock: lowStockCount,
                todayCount,
                completionRate
            },
            monthlyRevenue: formattedMonthlyData,
            recentBookings
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
