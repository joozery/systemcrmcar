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
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch('/api/dashboard/stats');
                const statsData = await statsRes.json();
                setData(statsData);

                // Fetch User Role
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserRole(userData.user.role);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex bg-[#f3f5f8] h-screen w-full items-center justify-center">
                <Loader2 className="animate-spin text-[#2563eb]" size={48} />
            </div>
        );
    }

    const { stats, categoryStats, realtimeQueue, totalCars, monthlyRevenue, recentBookings, extraStats } = data || {};
    const isSale = userRole === 'sale';

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
                        <p className="text-gray-400 font-medium">ข้อมูลการดำเนินงานจริงแบบ Real-time ของร้าน</p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-gray-600">
                            {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {!isSale && (
                        <StatCard
                            title="รายรับทั้งหมด"
                            value={`฿${stats?.totalRevenue.toLocaleString()}`}
                            icon={<DollarSign size={24} />}
                            trend={`+${extraStats?.completionRate}% วันนี้`}
                            isUp={true}
                            color="bg-green-500"
                        />
                    )}
                    <StatCard
                        title="จำนวนรถทั้งหมด"
                        value={totalCars}
                        icon={<Package size={24} />}
                        trend={`จากสมาชิก ${stats?.totalMembers} คน`}
                        isUp={true}
                        color="bg-[#2563eb]"
                    />
                    <StatCard
                        title="คิวงานรอดำเนินการ"
                        value={realtimeQueue?.waiting}
                        icon={<Clock size={24} />}
                        trend="Live Queue"
                        isUp={false}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="จำนวนสมาชิก"
                        value={stats?.totalMembers}
                        icon={<Users size={24} />}
                        trend={`ใหม่ +${extraStats?.newMembers}`}
                        isUp={true}
                        color="bg-purple-500"
                    />
                </div>

                {/* Middle Section: Queue & Services */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Live Queue Status */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-6 flex items-center justify-between flex-row">
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Real-time Queue</CardTitle>
                            <Activity className="text-[#2563eb]" size={20} />
                        </CardHeader>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-black text-blue-600 uppercase">รอทำ (Waiting)</span>
                                    <span className="text-lg font-black text-blue-700">{realtimeQueue?.waiting}</span>
                                </div>
                                <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${(realtimeQueue?.waiting / (realtimeQueue?.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-black text-orange-600 uppercase">กำลังทำ (Doing)</span>
                                    <span className="text-lg font-black text-orange-700">{realtimeQueue?.doing}</span>
                                </div>
                                <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full transition-all" style={{ width: `${(realtimeQueue?.doing / (realtimeQueue?.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                            <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-black text-green-600 uppercase">เสร็จแล้ว (Done)</span>
                                    <span className="text-lg font-black text-green-700">{realtimeQueue?.done}</span>
                                </div>
                                <div className="w-full bg-green-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full transition-all" style={{ width: `${(realtimeQueue?.done / (realtimeQueue?.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Service Breakdown */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-6 flex items-center justify-between flex-row">
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">แยกตามประเภทบริการ</CardTitle>
                            <TrendingUp className="text-[#2563eb]" size={20} />
                        </CardHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <ServiceStat label="ล้างรถ" value={categoryStats?.wash} icon={<Activity size={16} />} color="bg-blue-50 text-blue-600" />
                            <ServiceStat label="เซรามิก" value={categoryStats?.ceramic} icon={<Sparkles size={16} />} color="bg-purple-50 text-purple-600" />
                            <ServiceStat label="พ่นกันสนิม" value={categoryStats?.rustProofing} icon={<Package size={16} />} color="bg-orange-50 text-orange-600" />
                            <ServiceStat label="Wrap Car" value={categoryStats?.wrapCar} icon={<ShoppingBag size={16} />} color="bg-pink-50 text-pink-600" />
                        </div>
                    </Card>

                    {/* Recent Bookings */}
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-6 flex items-center justify-between flex-row">
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">ความเคลื่อนไหวล่าสุด</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">
                            {recentBookings?.map((b: any) => (
                                <div key={b._id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                        <Activity size={16} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate">{b.carPlate}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate">{b.serviceId?.name}</p>
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] rounded-lg border-0 ${
                                        b.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {b.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Revenue Chart */}
                {!isSale && (
                    <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden p-6">
                        <CardHeader className="p-0 mb-8">
                            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">กราฟรายได้รายเดือน</CardTitle>
                            <p className="text-sm text-gray-400 font-medium">วิเคราะห์รายได้ย้อนหลัง 6 เดือน</p>
                        </CardHeader>
                        <div className="h-[300px] w-full">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
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
                                        <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}

function ServiceStat({ label, value, icon, color }: any) {
    return (
        <div className="p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-gray-900">{value || 0}</p>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isUp, color, textColor = "text-white" }: any) {
    return (
        <Card className="rounded-3xl border-0 shadow-sm bg-white p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-[4rem] group-hover:scale-110 transition-transform`} />
            <div className={`w-12 h-12 ${color} ${textColor} rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-black/5`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value?.toLocaleString()}</h3>
                <span className={`text-[10px] font-bold leading-none ${isUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-0.5`}>
                    {trend}
                </span>
            </div>
        </Card>
    );
}
