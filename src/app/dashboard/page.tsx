"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Users, Calendar, DollarSign, Activity,
    ArrowUpRight, ArrowDownRight, TrendingUp,
    Package, Clock, CheckCircle, Loader2, Sparkles,
    ChevronRight, CreditCard, ShoppingBag
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const d = await res.json();
                setData(d);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex bg-[#f3f5f8] h-screen w-full items-center justify-center">
                <Loader2 className="animate-spin text-[#2563eb]" size={48} />
            </div>
        );
    }

    const { stats, monthlyRevenue, recentBookings } = data || {};

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-6 py-6 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            สรุปภาพรวมระบบ (Dashboard)
                            <Sparkles className="text-[#2563eb]" size={24} />
                        </h1>
                        <p className="text-gray-400 font-medium">ยินดีต้อนรับกลับมา! นี่คือสรุปผลการดำเนินงานของคุณวันนี้</p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-gray-600">
                            {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="รายรับทั้งหมด"
                        value={`฿${stats?.totalRevenue.toLocaleString()}`}
                        icon={<DollarSign size={24} />}
                        trend="+12.5%"
                        isUp={true}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="จำนวนสมาชิก"
                        value={stats?.totalMembers}
                        icon={<Users size={24} />}
                        trend="+4"
                        isUp={true}
                        color="bg-[#2563eb]"
                        textColor="text-black"
                    />
                    <StatCard
                        title="งานรอดำเนินการ"
                        value={stats?.activeBookings}
                        icon={<Clock size={24} />}
                        trend="-2"
                        isUp={false}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="ประวัติการจอง"
                        value={stats?.totalBookings}
                        icon={<Calendar size={24} />}
                        trend="+8%"
                        isUp={true}
                        color="bg-blue-500"
                    />
                </div>

                {/* Charts & Tasks */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <Card className="xl:col-span-2 rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-gray-900 tracking-tight">กราฟรายได้รายเดือน</CardTitle>
                                <p className="text-sm text-gray-400 font-medium">เปรียบเทียบผลประกอบการในแต่ละเดือน</p>
                            </div>
                            <Button variant="outline" className="rounded-xl border-gray-100 font-bold text-xs h-9">ดูรายงานเต็ม</Button>
                        </CardHeader>
                        <div className="h-[350px] w-full">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontWeight: 'bold', color: '#000' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#2563eb"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* Recent Bookings */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-6 flex items-center justify-between flex-row">
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">คิวงานล่าสุด</CardTitle>
                            <TrendingUp className="text-[#2563eb]" size={20} />
                        </CardHeader>
                        <div className="space-y-6">
                            {recentBookings?.map((b: any) => (
                                <div key={b._id} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-[#2563eb]/10 transition-colors">
                                        <Activity size={20} className="text-gray-400 group-hover:text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate">{b.carPlate}</p>
                                        <p className="text-xs text-gray-400 font-medium">{b.serviceId?.name}</p>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${b.status === 'เสร็จสิ้น' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {b.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-8 rounded-xl bg-gray-900 text-white hover:bg-black h-12 font-bold">
                            จัดการคิวทั้งหมด <ChevronRight size={18} className="ml-2" />
                        </Button>
                    </Card>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                    {/* Activity logs or more charts could go here */}
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isUp, color, textColor = "text-white" }: any) {
    return (
        <Card className="rounded-3xl border-0 shadow-sm bg-white p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
            <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-bl-[3rem] group-hover:scale-110 transition-transform`} />
            <div className={`w-12 h-12 ${color} ${textColor} rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-black/5`}>
                {icon}
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                <span className={`text-xs font-bold leading-none ${isUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-0.5`}>
                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </span>
            </div>
        </Card>
    );
}
