"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
    Calendar, Clock, ChevronRight, ChevronLeft, 
    Check, AlertCircle, Loader2, MapPin, 
    Car, Sparkles, User, ArrowRight, X,
    Globe, Plus
} from "lucide-react";
import liff from "@line/liff";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

function BookingContent() {
    const searchParams = useSearchParams();
    const urlId = searchParams.get("id");
    const [customerId, setCustomerId] = useState<string | null>(urlId);
    const [member, setMember] = useState<any>(null);
    
    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [selectedCar, setSelectedCar] = useState<string>("new");
    const [plateLetters, setPlateLetters] = useState("");
    const [plateNumber, setPlateNumber] = useState("");
    const [carProvince, setCarProvince] = useState("");
    const [carBrand, setCarBrand] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carColor, setCarColor] = useState("");
    const [carYear, setCarYear] = useState("");
    const [carSize, setCarSize] = useState("M");
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [lang, setLang] = useState<"TH" | "EN">("TH");

    useEffect(() => {
        const initLiff = async () => {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (!liffId) return;

            try {
                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setCustomerId(profile.userId);
                } else {
                    liff.login();
                }
            } catch (err) {
                console.error("LIFF initialization failed", err);
            }
        };

        if (!urlId) {
            initLiff();
        }
    }, [urlId]);

    // Check if customer is registered
    useEffect(() => {
        const checkCustomer = async () => {
            if (!customerId) return;
            try {
                const res = await fetch(`/api/customers/${customerId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMember(data);
                    if (data.cars && data.cars.length > 0) {
                        setSelectedCar(data.cars[0].plate);
                        setPlateLetters(""); 
                        setPlateNumber("");
                        setCarProvince(data.cars[0].province || "");
                        setCarBrand(data.cars[0].brand || "");
                        setCarModel(data.cars[0].model || "");
                        setCarColor(data.cars[0].color || "");
                        setCarYear(data.cars[0].year || "");
                        setCarSize(data.cars[0].size || "M");
                    }
                    if (!data.isRegistered) {
                        window.location.href = `/register-member?uid=${customerId}`;
                    }
                } else if (res.status === 404) {
                    window.location.href = `/register-member?uid=${customerId}`;
                }
            } catch (err) {
                console.error("Check customer error", err);
            }
        };
        checkCustomer();
    }, [customerId]);

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
            
            // Filter to only include services that are open for service
            const filteredServices = sData.filter((s: any) => s.status === "เปิดให้บริการ");
            setServices(filteredServices);
            setBookings(bData);
            
            const urlService = searchParams.get("service");
            if (filteredServices.length > 0) {
                const preselected = filteredServices.find((s: any) => s._id === urlService || s.id === urlService);
                setSelectedService(preselected ? preselected._id : filteredServices[0]._id);
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
        if (!selectedService || !selectedDate || !selectedTime || !customerId) {
            alert(lang === "TH" ? "กรุณาเลือกบริการและเวลาให้ครบถ้วน" : "Please select service and time");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const service = services.find(s => s._id === selectedService);
            const isNewCar = selectedCar === "new";
            const finalPlate = isNewCar ? `${plateLetters} ${plateNumber}`.trim() : selectedCar;
            const finalProvince = isNewCar ? carProvince : (member?.cars?.find((c: any) => c.plate === selectedCar)?.province || "");
            const finalBrand = isNewCar ? carBrand : (member?.cars?.find((c: any) => c.plate === selectedCar)?.brand || "");
            const finalModel = isNewCar ? carModel : (member?.cars?.find((c: any) => c.plate === selectedCar)?.model || "");
            const finalColor = isNewCar ? carColor : (member?.cars?.find((c: any) => c.plate === selectedCar)?.color || "");
            const finalYear = isNewCar ? carYear : (member?.cars?.find((c: any) => c.plate === selectedCar)?.year || "");
            const finalSize = isNewCar ? carSize : (member?.cars?.find((c: any) => c.plate === selectedCar)?.size || "M");
            
            if (!finalPlate) {
                alert(lang === "TH" ? "กรุณาระบุทะเบียนรถ" : "Please enter car plate");
                setIsSubmitting(false);
                return;
            }

            // Use the actual car size for pricing
            const price = service?.prices?.[finalSize] || service?.prices?.['M'] || 0;
            const bookingDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    serviceId: selectedService,
                    bookingDate: bookingDateTime.toISOString(),
                    carPlate: finalPlate,
                    carProvince: finalProvince,
                    carBrand: finalBrand,
                    carModel: finalModel,
                    carColor: finalColor,
                    carYear: finalYear,
                    carSize: finalSize,
                    price: price,
                    status: 'รอดำเนินการ',
                    bookingSource: 'online'
                })
            });
            
            if (res.ok) {
                setIsSuccessModalOpen(true);
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to book");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDurationInMinutes = (durationStr: string) => {
        if (!durationStr) return 30; // Default
        const hoursMatch = durationStr.match(/(\d+)\s*ชม/);
        const minsMatch = durationStr.match(/(\d+)\s*นาที/);
        let total = 0;
        if (hoursMatch) total += parseInt(hoursMatch[1]) * 60;
        if (minsMatch) total += parseInt(minsMatch[1]);
        return total > 0 ? total : 30;
    };

    const isSlotFull = (time: string) => {
        const currentService = services.find(s => s._id === selectedService);
        if (!currentService) return false;
        
        const currentCategory = currentService.category;
        const currentDuration = getDurationInMinutes(currentService.duration);
        
        // Target slot time object
        const [h, m] = time.split(':').map(Number);
        const slotStart = new Date(selectedDate);
        slotStart.setHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + (currentDuration - 1) * 60000); // Duration of the service we WANT to book

        return bookings.some(b => {
            if (b.status === 'ยกเลิก') return false;
            
            // Filter by Service - separate queues per service
            const isSameService = b.serviceId?._id === selectedService || b.serviceId === selectedService;
            if (!isSameService) return false;

            const bStart = new Date(b.bookingDate);
            const bDuration = getDurationInMinutes(b.serviceId?.duration);
            const bEnd = new Date(bStart.getTime() + (bDuration - 1) * 60000);

            // Overlap check: 
            // (StartA <= EndB) and (EndA >= StartB)
            return (slotStart <= bEnd && slotEnd >= bStart);
        });
    };

    const isSlotPast = (time: string) => {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate < now;
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
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
                            {(() => {
                                // Group services by category
                                const groups: { [key: string]: any[] } = {};
                                services.forEach(s => {
                                    const cat = s.category || (lang === "TH" ? "อื่นๆ" : "Others");
                                    if (!groups[cat]) groups[cat] = [];
                                    groups[cat].push(s);
                                });

                                // Define requested category order/names
                                const requestedCategories = [
                                    "ล้างรถและทำความสะอาด",
                                    "ตรวจเช็ค/ดูแลตามระยะ ทุก 6 เดือน"
                                ];

                                return Object.keys(groups).sort((a, b) => {
                                    const idxA = requestedCategories.indexOf(a);
                                    const idxB = requestedCategories.indexOf(b);
                                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                    if (idxA !== -1) return -1;
                                    if (idxB !== -1) return 1;
                                    return a.localeCompare(b);
                                }).map(cat => (
                                    <div key={cat}>
                                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                            {cat}
                                        </div>
                                        {groups[cat].map(s => (
                                            <SelectItem key={s._id} value={s._id} className="font-bold py-4 pl-8 focus:bg-blue-50 focus:text-blue-700 transition-colors cursor-pointer">
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </div>
                                ));
                            })()}
                        </SelectContent>
                    </Select>
                </div>

                {/* Car Selection Section */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Car size={18} />
                        </div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {lang === "TH" ? "ข้อมูลรถยนต์" : "Car Information"}
                        </label>
                    </div>

                    {member?.cars?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {member.cars.map((car: any) => (
                                <button
                                    key={car.plate}
                                    onClick={() => {
                                        setSelectedCar(car.plate);
                                        setCarSize(car.size || "M");
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start ${selectedCar === car.plate ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white border-slate-50'}`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={`text-[10px] font-black uppercase mb-1 ${selectedCar === car.plate ? 'text-indigo-400' : 'text-slate-300'}`}>{car.brand} {car.model}</span>
                                        <span className={`text-base font-black ${selectedCar === car.plate ? 'text-indigo-900' : 'text-slate-900'}`}>{car.plate}</span>
                                        <span className={`text-[9px] font-bold ${selectedCar === car.plate ? 'text-indigo-400/70' : 'text-slate-300'}`}>{car.province}</span>
                                    </div>
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedCar("new")}
                                className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center ${selectedCar === "new" ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}
                            >
                                <Plus size={18} className={selectedCar === "new" ? "text-indigo-500" : "text-slate-400"} />
                                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{lang === "TH" ? "เพิ่มรถใหม่" : "ADD NEW"}</span>
                            </button>
                        </div>
                    )}

                    {(selectedCar === "new" || !member?.cars?.length) && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ยี่ห้อรถ</Label>
                                    <Input
                                        placeholder="เช่น Toyota"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                        value={carBrand}
                                        onChange={(e) => setCarBrand(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รุ่นรถ</Label>
                                    <Input
                                        placeholder="เช่น Camry"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                        value={carModel}
                                        onChange={(e) => setCarModel(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สีรถ</Label>
                                    <Input
                                        placeholder="เช่น ขาว"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                        value={carColor}
                                        onChange={(e) => setCarColor(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ปีรถ</Label>
                                    <Input
                                        placeholder="เช่น 2023"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                        value={carYear}
                                        onChange={(e) => setCarYear(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-50">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ตัวอักษร</Label>
                                    <Input
                                        placeholder="กข"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm text-center"
                                        value={plateLetters}
                                        onChange={(e) => setPlateLetters(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หมายเลขทะเบียน</Label>
                                    <Input
                                        placeholder="1234"
                                        type="number"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                        value={plateNumber}
                                        onChange={(e) => setPlateNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จังหวัด</Label>
                                <Input
                                    placeholder="เช่น กรุงเทพฯ"
                                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                    value={carProvince}
                                    onChange={(e) => setCarProvince(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-slate-50">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === "TH" ? "ขนาดรถ" : "CAR SIZE"}</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setCarSize(s)}
                                            className={`h-11 rounded-xl font-black text-xs transition-all border ${
                                                carSize === s 
                                                ? 'bg-[#0a0b0a] text-white border-black shadow-lg' 
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
                            <button 
                                onClick={() => scroll('left')}
                                className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-slate-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                onClick={() => scroll('right')}
                                className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-slate-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5 snap-x scroll-smooth"
                    >
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
            {/* Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={(open) => {
                if (!open) window.location.href = `/member-profile?id=${customerId}`;
            }}>
                <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="pt-12 pb-8 px-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-200 relative z-10">
                                <Check size={32} strokeWidth={3} />
                            </div>
                        </div>
                        
                        <DialogHeader className="space-y-2 mb-8">
                            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">
                                {lang === "TH" ? "จองคิวสำเร็จแล้ว!" : "Booking Successful!"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold text-sm leading-relaxed px-4">
                                {lang === "TH" 
                                    ? "เจ้าหน้าที่จะตรวจสอบข้อมูลและยืนยันการนัดหมายผ่าน LINE OA ของคุณในเร็วๆ นี้ครับ" 
                                    : "Our team will review and confirm your appointment via LINE OA shortly."}
                            </DialogDescription>
                        </DialogHeader>

                        <Button 
                            onClick={() => window.location.href = `/member-profile?id=${customerId}`}
                            className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-base shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                        >
                            {lang === "TH" ? "ตกลง" : "OK, Great!"}
                        </Button>
                    </div>
                    
                    <div className="bg-slate-50 py-4 px-8 border-t border-slate-100 flex justify-center">
                        <div className="flex items-center gap-2 opacity-40">
                            <img src="/logo/logoprosteam.png" alt="Logo" className="h-4 grayscale" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Service</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
