"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
    Calendar, Clock, ChevronRight, ChevronLeft, 
    Check, AlertCircle, Loader2, MapPin, 
    Car, Sparkles, User, ArrowRight, X,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function BookingContent() {
    const searchParams = useSearchParams();
    const customerId = searchParams.get("id");
    
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [lang, setLang] = useState<"TH" | "EN">("TH");

    // Dates for the horizontal picker (next 14 days)
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: d.toLocaleDateString(lang === "TH" ? 'th-TH' : 'en-US', { weekday: 'short' }),
            date: d.getDate(),
            month: d.toLocaleDateString(lang === "TH" ? 'th-TH' : 'en-US', { month: 'short' })
        };
    });

    // Time slots
    const timeSlots = [
        "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", 
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sRes, bRes] = await Promise.all([
                fetch('/api/services'),
                fetch(`/api/bookings?date=${selectedDate}`)
            ]);
            const [sData, bData] = await Promise.all([sRes.json(), bRes.json()]);
            
            // Filter to only include "ล้างสีดูดฝุ่น"
            const filteredServices = sData.filter((s: any) => s.name === "ล้างสีดูดฝุ่น");
            setServices(filteredServices);
            setBookings(bData);
            
            if (filteredServices.length > 0) {
                setSelectedService(filteredServices[0]._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime || !customerId) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    serviceId: selectedService,
                    bookingDate: selectedDate,
                    bookingTime: selectedTime,
                    status: 'pending'
                })
            });
            
            if (res.ok) {
                alert(lang === "TH" ? "จองคิวสำเร็จแล้ว!" : "Booking successful!");
                window.location.href = `/member-profile?id=${customerId}`;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSlotFull = (time: string) => {
        return bookings.filter(b => b.bookingTime === time && b.status !== 'cancelled').length >= 2; // Assuming 2 slots per time
    };

    const isSlotPast = (time: string) => {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate < now;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32 no-scrollbar overflow-y-auto font-sans">
            <style jsx global>{`
                html, body, .no-scrollbar {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+Thai:wght@400;700;900&display=swap');
            `}</style>

            {/* Top Branding Section */}
            <div className="bg-[#0a0b0a] pt-10 pb-20 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb] rounded-full filter blur-[120px] opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600 rounded-full filter blur-[100px] opacity-10 -ml-20 -mb-20"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 mb-8 border border-white/10">
                        <button 
                            onClick={() => setLang("TH")}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black transition-all duration-300 ${lang === "TH" ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                        >
                            TH
                        </button>
                        <button 
                            onClick={() => setLang("EN")}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black transition-all duration-300 ${lang === "EN" ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                        >
                            EN
                        </button>
                    </div>

                    <div className="w-20 h-10 mb-6 flex items-center justify-center">
                        <img src="/logo/logoprosteam.png" alt="Logo" className="w-full h-full object-contain brightness-200" />
                    </div>

                    <h1 className="text-3xl font-black text-white text-center tracking-tighter leading-none mb-2 uppercase">
                        {lang === "TH" ? "นัดหมายบริการ" : "BOOK SERVICE"}
                    </h1>
                    <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">
                        <div className="w-8 h-[1px] bg-blue-400/30"></div>
                        <span>Pro Steam Car Detail</span>
                        <div className="w-8 h-[1px] bg-blue-400/30"></div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20 space-y-8">
                {/* Service Selection Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Sparkles size={18} />
                        </div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {lang === "TH" ? "เลือกประเภทบริการ" : "Select Service Type"}
                        </label>
                    </div>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 font-black text-slate-900 text-base focus:ring-2 focus:ring-blue-500 transition-all">
                            <SelectValue placeholder={lang === "TH" ? "เลือกบริการที่คุณต้องการ" : "Select your service"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            {services.map(s => (
                                <SelectItem key={s._id} value={s._id} className="font-bold py-4 focus:bg-blue-50 focus:text-blue-700 transition-colors cursor-pointer">
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Selection Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">
                                {new Date(selectedDate).toLocaleDateString(lang === "TH" ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === "TH" ? "เลือกวันนัดหมาย" : "SELECT DATE"}</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-slate-50">
                                <ChevronLeft size={18} />
                            </button>
                            <button className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-slate-50">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5 snap-x">
                        {dates.map((d, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(d.full)}
                                className={`flex flex-col items-center justify-center min-w-[72px] h-[96px] rounded-2xl transition-all duration-300 snap-center border-2 ${selectedDate === d.full ? 'bg-[#2563eb] text-white border-blue-500 shadow-2xl shadow-blue-200 scale-105' : 'bg-white text-slate-400 border-transparent hover:border-slate-200 active:scale-95 shadow-lg shadow-slate-100'}`}
                            >
                                <span className={`text-[10px] font-black uppercase mb-2 ${selectedDate === d.full ? 'text-white/70' : 'text-slate-300'}`}>{d.day}</span>
                                <span className="text-2xl font-black leading-none">{d.date}</span>
                                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${selectedDate === d.full ? 'bg-white' : 'bg-transparent'}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Selection Section */}
                <div className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{lang === "TH" ? "ช่วงเวลาที่ว่าง" : "AVAILABLE SLOTS"}</h3>
                        </div>
                        <Badge className="bg-slate-100 text-slate-400 border-0 text-[9px] font-black rounded-full px-3 py-1">
                            {timeSlots.length} Slots
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((time, i) => {
                            const full = isSlotFull(time);
                            const past = isSlotPast(time);
                            const selected = selectedTime === time;

                            return (
                                <button
                                    key={i}
                                    disabled={past || full}
                                    onClick={() => setSelectedTime(time)}
                                    className={`relative h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 active:scale-95 overflow-hidden ${selected ? 'bg-[#0a0b0a] text-white border-black shadow-2xl scale-105' : past || full ? 'bg-slate-50 text-slate-200 border-transparent cursor-not-allowed' : 'bg-white text-slate-600 border-slate-50 shadow-lg shadow-slate-100 hover:border-blue-200'}`}
                                >
                                    <span className={`text-base font-black ${selected ? 'text-white' : past || full ? 'text-slate-200' : 'text-slate-900'}`}>{time}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${selected ? 'text-blue-400' : past ? 'text-slate-200' : full ? 'text-red-400' : 'text-green-500'}`}>
                                        {past ? "EXPIRED" : full ? "FULL" : "AVAILABLE"}
                                    </span>
                                    {selected && <div className="absolute top-1 right-2"><Check size={12} className="text-blue-400" /></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Ultra-Premium Confirm Button */}
            {selectedTime && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/70 backdrop-blur-3xl z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div className="max-w-md mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <Button 
                            onClick={handleBooking}
                            disabled={isSubmitting}
                            className="relative w-full h-16 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-black text-base shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] border-0 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                <>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] text-white/60 uppercase tracking-widest mb-1">{lang === "TH" ? "ยืนยันการจอง" : "PROCEED WITH"}</span>
                                        <span className="text-base uppercase tracking-tighter">{lang === "TH" ? "นัดหมายบริการ" : "CONFIRM BOOKING"}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <ArrowRight size={22} />
                                    </div>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
