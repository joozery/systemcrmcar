"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Droplets, Shield, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";

export function SidebarRight({ data, user }: { data?: any, user?: any }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const completionRate = data?.extraStats?.completionRate ?? 0;
    const todayCount = data?.extraStats?.todayCount ?? 0;
    const target = 25; // Could be dynamic later

    // Performance label
    const getPerformanceLabel = (rate: number) => {
        if (rate >= 90) return "ยอดเยี่ยม";
        if (rate >= 70) return "ดีมาก";
        if (rate >= 50) return "ปกติ";
        return "ต้องเร่งมือ";
    };

    return (
        <aside className="w-[340px] bg-white border-l p-6 h-screen sticky top-0 overflow-y-auto hidden xl:block z-10 custom-shadow no-scrollbar">
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="w-12 h-12 border-2 border-[#bbfc2f]/20 shadow-sm">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=bbfc2f&color=000`} />
                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{user?.username || "ผู้จัดการร้าน"}</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{user?.role || "Administrator"}</p>
                </div>
            </div>

            <div className="flex justify-between text-center mb-8 border-b pb-6">
                <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">รถเข้าร้าน</p>
                    <p className="font-black text-gray-900">{todayCount} คัน</p>
                </div>
                <div className="flex-1 border-x border-gray-100 px-2">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">เป้าหมาย</p>
                    <p className="font-black text-gray-900">{target} คัน</p>
                </div>
                <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">ยอดขาย</p>
                    <p className={`font-black ${completionRate > 50 ? 'text-green-500' : 'text-orange-500'}`}>{getPerformanceLabel(completionRate)}</p>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">ตารางนัดหมาย</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center cursor-pointer hover:text-black transition-colors">
                        {new Intl.DateTimeFormat('th-TH', { month: 'short', year: 'numeric' }).format(new Date())}
                        <ChevronDown size={14} className="ml-1" />
                    </span>
                </div>
                <div className="bg-gray-50/50 rounded-3xl p-2 min-h-[300px] flex items-center justify-center border border-gray-100">
                    {isMounted ? (
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="w-full border-0 p-0"
                            classNames={{
                                head_row: "flex w-full mt-2",
                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20 w-9 h-9",
                                day: "h-8 w-8 p-0 font-bold aria-selected:opacity-100 mx-auto flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-xs",
                                day_selected: "bg-[#bbfc2f] text-black hover:bg-[#bbfc2f] hover:text-black focus:bg-[#bbfc2f] focus:text-black font-black scale-110 shadow-lg shadow-[#bbfc2f]/30",
                                day_today: "bg-gray-200 text-gray-900 after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-black after:rounded-full",
                            }}
                        />
                    ) : (
                        <div className="animate-pulse flex flex-col items-center gap-4 w-full p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-48 bg-gray-200 rounded-3xl w-full"></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-900">ประสิทธิภาพทีมงาน</h3>
                    <span className="text-xs font-black text-gray-900">{completionRate}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3 font-medium">ภาพรวมชั่วโมงการทำงานสำเร็จวันนี้</p>
                <Progress value={completionRate} className="h-2.5 bg-gray-100 rounded-full" indicatorClassName="bg-[#bbfc2f] shadow-[0_0_10px_rgba(187,252,47,0.5)]" />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">คิวงานแนะนำ</h3>
                    <span className="text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-black transition-colors">ดูทั้งหมด</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl overflow-hidden relative h-24 bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100/50 transition-all hover:scale-105 active:scale-95 group">
                        <Droplets className="text-blue-500 mb-2 group-hover:bounce transition-all" size={20} />
                        <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm p-1.5 text-center border-t border-blue-100">
                            <p className="text-[9px] text-blue-700 font-black uppercase tracking-tighter">ล้างสี</p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden relative h-24 bg-orange-50/50 border border-orange-100 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100/50 transition-all hover:scale-105 active:scale-95 group">
                        <Star className="text-orange-500 mb-2" size={20} />
                        <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm p-1.5 text-center border-t border-orange-100">
                            <p className="text-[9px] text-orange-700 font-black uppercase tracking-tighter">ขัดเงา</p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden relative h-24 bg-purple-50/50 border border-purple-100 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100/50 transition-all hover:scale-105 active:scale-95 group">
                        <Shield className="text-purple-500 mb-2" size={20} />
                        <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm p-1.5 text-center border-t border-purple-100">
                            <p className="text-[9px] text-purple-700 font-black uppercase tracking-tighter">ฟิล์ม PPF</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
