"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Droplets, Shield, Star, Loader2, Calendar as CalendarIcon, Clock, Phone, User, X, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SidebarRight({ data, user }: { data?: any, user?: any }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
    const [dayBookings, setDayBookings] = useState<any[]>([]);
    const [isLoadingDay, setIsLoadingDay] = useState(false);

    const handleDaySelect = async (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setIsDayDetailsOpen(true);
        setIsLoadingDay(true);
        try {
            // Adjust for Thailand Timezone for the query
            const d = new Date(date);
            const dateStr = d.toISOString().split('T')[0];
            const res = await fetch(`/api/bookings?date=${dateStr}`);
            if (res.ok) {
                const bookings = await res.json();
                setDayBookings(bookings);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDay(false);
        }
    };

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
                <Avatar className="w-12 h-12 border-2 border-[#2563eb]/20 shadow-sm">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=2563eb&color=fff`} />
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
                            selected={selectedDate}
                            onSelect={handleDaySelect}
                            className="w-full border-0 p-0"
                            classNames={{
                                head_row: "flex w-full mt-2",
                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20 w-9 h-9",
                                day: "h-8 w-8 p-0 font-bold aria-selected:opacity-100 mx-auto flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-xs",
                                day_selected: "bg-[#2563eb] text-white hover:bg-[#2563eb] hover:text-white focus:bg-[#2563eb] focus:text-white font-black scale-110 shadow-lg shadow-[#2563eb]/30",
                                day_today: "bg-gray-100 text-gray-900 after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-black after:rounded-full",
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
                <Progress value={completionRate} className="h-2.5 bg-gray-100 rounded-full" indicatorClassName="bg-[#2563eb] shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">คิวงานแนะนำ</h3>
                    <span className="text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-black transition-colors">ดูทั้งหมด</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {data?.suggestedQueue && data.suggestedQueue.length > 0 ? (
                        data.suggestedQueue.map((item: any, idx: number) => (
                            <div key={idx} className="rounded-2xl overflow-hidden relative h-16 bg-gray-50/50 border border-gray-100 flex items-center px-4 gap-4 cursor-pointer hover:bg-[#2563eb]/5 transition-all group">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-[#2563eb]'}`}>
                                    {idx === 0 ? <Star size={18} /> : <Droplets size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-900 truncate">{item.carPlate}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold truncate uppercase tracking-tighter">{item.serviceId?.name || 'บริการทั่วไป'}</p>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 font-bold">ไม่มีคิวงานแนะนำในขณะนี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Day Details Modal */}
            <Dialog open={isDayDetailsOpen} onOpenChange={setIsDayDetailsOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden bg-white">
                    <DialogHeader className="bg-[#0a0b0a] p-5 text-white relative">
                        <DialogTitle className="text-lg font-black text-[#2563eb] tracking-tight">
                            คิวงานวันที่ {selectedDate?.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </DialogTitle>
                        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">สรุปรายการนัดหมายทั้งหมดในวันดังกล่าว</p>
                    </DialogHeader>
                    
                    <div className="p-5 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {isLoadingDay ? (
                            <div className="py-20 text-center">
                                <Loader2 className="animate-spin text-[#2563eb] mx-auto mb-4" size={40} />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูลคิวงาน...</p>
                            </div>
                        ) : dayBookings.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                                    <CalendarIcon size={32} className="text-slate-200" />
                                </div>
                                <h4 className="text-base font-black text-slate-400">ยังไม่มีรายการจอง</h4>
                                <p className="text-xs text-slate-300 font-bold">ไม่พบนัดหมายในวันที่ระบุ</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {dayBookings.map((b, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center gap-4 group hover:bg-indigo-50/50 hover:border-indigo-100 transition-all cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center shrink-0 border border-slate-50">
                                            <span className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">เวลานัด</span>
                                            <span className="text-sm font-black text-indigo-600">
                                                {new Date(b.bookingDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-base font-black text-slate-900 leading-none">{b.carPlate}</span>
                                                <Badge className="bg-white text-slate-400 border-slate-100 text-[9px] font-black h-5 px-1.5 rounded-lg">{b.carSize}</Badge>
                                            </div>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Sparkles size={12} className="text-[#2563eb]" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase truncate">{b.serviceId?.name || 'บริการทั่วไป'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                                    <User size={10} className="text-slate-300" />
                                                    {b.customerId?.firstName}
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                                    <Phone size={10} className="text-slate-300" />
                                                    {b.customerId?.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-tighter ${
                                            b.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-700' :
                                            b.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 p-5 flex justify-center border-t border-slate-100">
                         <Button onClick={() => setIsDayDetailsOpen(false)} className="bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs h-11 w-full shadow-lg shadow-slate-200 active:scale-95 transition-all uppercase tracking-widest">ปิดหน้านี้</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
