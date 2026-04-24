"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MainChartRow({ chartData }: { chartData?: any[] }) {
    const data = chartData && chartData.length > 0 ? chartData : [
        { name: "Sun", offline: 0 },
        { name: "Mon", offline: 0 },
        { name: "Tue", offline: 0 },
        { name: "Wed", offline: 0 },
        { name: "Thu", offline: 0 },
        { name: "Fri", offline: 0 },
        { name: "Sat", offline: 0 },
    ];
    return (
        <div className="grid grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2 rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">กิจกรรมการจองคิว</CardTitle>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black"></span> ออนไลน์</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2563eb]"></span> หน้าร้าน</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={true} horizontal={true} strokeDasharray="3 3" verticalFill={['#f9fafb', '#fff']} fillOpacity={0.2} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={() => ''} width={10} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="offline" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorOffline)" dot={false} activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="online" stroke="#111" strokeWidth={3} fill="none" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm relative overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">ความคืบหน้างาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="w-full relative z-10 space-y-5">
                        <div className="w-[60%]">
                            <p className="font-bold text-gray-900 leading-tight">56 คัน</p>
                            <p className="text-[10px] text-muted-foreground mb-1.5">คาดการณ์สัปดาห์นี้</p>
                            <Progress value={65} className="h-1.5 bg-gray-100 w-3/4" indicatorClassName="bg-gray-300" />
                        </div>
                        <div className="w-[60%]">
                            <p className="font-bold text-gray-900 leading-tight">236 คัน</p>
                            <p className="text-[10px] text-muted-foreground mb-1.5">จำนวนรถที่ให้บริการแล้ว</p>
                            <Progress value={85} className="h-1.5 bg-gray-100" indicatorClassName="bg-gray-300" />
                        </div>
                        <div className="w-[60%]">
                            <p className="font-bold text-gray-900 leading-tight">10 ชม.</p>
                            <p className="text-[10px] text-muted-foreground mb-1.5">เวลาเฉลี่ย/คัน</p>
                            <Progress value={45} className="h-1.5 bg-gray-100 w-1/2" indicatorClassName="bg-[#2563eb]" />
                        </div>
                    </div>

                    {/* Big Circular Graphic on the right like mockup */}
                    <div className="absolute -right-12 top-16 w-52 h-52 bg-[#2563eb] rounded-full flex items-center justify-center p-4 z-0">
                        <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                            <Star className="text-white w-20 h-20 fill-current opacity-80" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
