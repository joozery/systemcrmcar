"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
    User, Award, Gift, History, 
    QrCode, ChevronRight, Star, 
    Clock, Car, Zap, ShieldCheck, Plus,
    X, Sparkles, MapPin, Receipt,
    Info, CreditCard, ChevronLeft, Calendar
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';

function MemberProfileContent() {
    const searchParams = useSearchParams();
    const lineId = searchParams.get("id");
    const [member, setMember] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    // Modals
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);

    // Add Car Form
    const [carForm, setCarForm] = useState({
        plate: "",
        brand: "",
        model: "",
        size: "M",
        color: ""
    });
    const [isSubmittingCar, setIsSubmittingCar] = useState(false);

    const fetchMember = async () => {
        if (!lineId) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/customers/${lineId}`);
            if (res.ok) {
                const data = await res.json();
                setMember(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMember();
    }, [lineId]);

    const fetchHistory = async () => {
        if (!member?._id) return;
        setIsLoadingDetails(true);
        setIsHistoryModalOpen(true);
        try {
            const res = await fetch(`/api/bookings?customerId=${member._id}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const fetchRewards = async () => {
        setIsLoadingDetails(true);
        setIsRedeemModalOpen(true);
        try {
            const res = await fetch(`/api/services`);
            if (res.ok) {
                const data = await res.json();
                setServices(data.filter((s: any) => s.redeemable));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleAddCar = async () => {
        if (!carForm.plate) return;
        setIsSubmittingCar(true);
        try {
            const updatedCars = [...(member.cars || []), carForm];
            const res = await fetch(`/api/customers/${member._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cars: updatedCars })
            });
            if (res.ok) {
                await fetchMember();
                setIsAddCarModalOpen(false);
                setCarForm({ plate: "", brand: "", model: "", size: "M", color: "" });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingCar(false);
        }
    };

    useEffect(() => {
        document.body.classList.add('no-scrollbar');
        return () => {
            document.body.classList.remove('no-scrollbar');
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0b0a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!member && lineId) {
        return (
            <div className="min-h-screen bg-[#0a0b0a] flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck size={64} className="text-[#2563eb] mb-4 opacity-20" />
                <h1 className="text-white text-xl font-bold mb-2">ไม่พบข้อมูลสมาชิก</h1>
                <p className="text-gray-400 text-sm">กรุณาลงทะเบียนผ่าน LINE OA ของเราก่อนเข้าใช้งาน</p>
                <Button className="mt-8 bg-[#2563eb] rounded-xl px-10">กลับหน้าหลัก</Button>
            </div>
        );
    }

    const displayMember = member || {
        firstName: "ทศพล",
        lastName: "วัฒนะแสงโรยศรี",
        points: 1500,
        phone: "0838346686",
        cars: [],
        coupons: []
    };

    const getTier = (pts: number) => {
        if (pts >= 5000) return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", icon: <Zap size={14} />, gradient: "from-cyan-500 to-blue-600" };
        if (pts >= 2000) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: <Star size={14} />, gradient: "from-yellow-500 to-orange-600" };
        return { name: "Silver", color: "text-[#2563eb]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20", icon: <ShieldCheck size={14} />, gradient: "from-[#2563eb] to-[#1d4ed8]" };
    };

    const tier = getTier(displayMember.points);
    const nextTierPoints = displayMember.points >= 2000 ? 5000 : 2000;
    const progress = Math.min((displayMember.points / nextTierPoints) * 100, 100);

    return (
        <div className="min-h-screen bg-[#f3f5f8] pb-20 no-scrollbar overflow-y-auto">
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
            `}</style>
            {/* Upper Header Section */}
            <div className="bg-[#0a0b0a] pt-8 pb-16 px-5 rounded-b-2xl relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb] rounded-full filter blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="w-24 h-12 flex items-center justify-center shrink-0">
                        <img src="/logo/logoprosteam.png" alt="Logo" className="w-full h-full object-contain object-left" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-white font-black text-lg tracking-tighter leading-tight uppercase">Member <span className="text-[#2563eb]">Card</span></h2>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-tight">Pro Steam Car Detail</p>
                    </div>
                </div>

                {/* Digital Card */}
                <div className={`bg-gradient-to-br ${tier.gradient} rounded-xl p-6 shadow-xl relative overflow-hidden group border border-white/10`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Car size={120} className="text-white" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">ยินดีต้อนรับสมาชิก</h3>
                                <p className="text-white text-2xl font-black tracking-tight leading-none">{displayMember.firstName} {displayMember.lastName}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 shadow-lg" onClick={() => setIsQRModalOpen(true)}>
                                <QrCode size={28} className="text-white" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-white text-5xl font-black tracking-tighter drop-shadow-md">{displayMember.points.toLocaleString()}</span>
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Points</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 -mt-10 relative z-20 space-y-4">
                {/* Points Progress */}
                <Card className="bg-white rounded-xl border-0 shadow-lg p-5">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-0.5">ระดับปัจจุบัน</span>
                            <span className={`text-[11px] font-black ${tier.color} uppercase tracking-wider`}>{tier.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-0.5">เป้าหมายต่อไป</span>
                            <span className="text-[11px] font-black text-gray-900">ขาดอีก {(nextTierPoints - displayMember.points).toLocaleString()} แต้ม</span>
                        </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-100 rounded-full" />
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2.5">
                    <button 
                        onClick={() => window.location.href = `/booking?id=${displayMember._id}`}
                        className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 border border-transparent hover:border-[#2563eb]/30 transition-all active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all shadow-inner">
                            <Calendar size={20} />
                        </div>
                        <div className="text-center">
                            <span className="text-[11px] font-black text-gray-900 block">จองคิว</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Booking</span>
                        </div>
                    </button>
                    <button 
                        onClick={fetchRewards}
                        className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 border border-transparent hover:border-[#2563eb]/30 transition-all active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                            <Gift size={20} />
                        </div>
                        <div className="text-center">
                            <span className="text-[11px] font-black text-gray-900 block">แลกรางวัล</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Rewards</span>
                        </div>
                    </button>
                    <button 
                        onClick={fetchHistory}
                        className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 border border-transparent hover:border-[#2563eb]/30 transition-all active:scale-95 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white transition-all shadow-inner">
                            <History size={20} />
                        </div>
                        <div className="text-center">
                            <span className="text-[11px] font-black text-gray-900 block">ประวัติการใช้</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">History</span>
                        </div>
                    </button>
                </div>

                {/* Details Section */}
                <Tabs defaultValue="coupons" className="w-full">
                    <TabsList className="w-full bg-white rounded-xl h-12 p-1 shadow-lg border border-gray-100">
                        <TabsTrigger value="coupons" className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider data-[state=active]:bg-[#0a0b0a] data-[state=active]:text-white transition-all">
                            สิทธิพิเศษ
                        </TabsTrigger>
                        <TabsTrigger value="cars" className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider data-[state=active]:bg-[#0a0b0a] data-[state=active]:text-white transition-all">
                            รถของฉัน
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="coupons" className="mt-5 space-y-2.5">
                        {displayMember.coupons && displayMember.coupons.length > 0 ? (
                            displayMember.coupons.map((coupon: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-xl p-4 shadow-lg border border-gray-50 flex items-center gap-4 relative overflow-hidden group active:scale-95 transition-all">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-blue-50 group-hover:border-[#2563eb]/20 transition-all">
                                        <Sparkles size={20} className="text-[#2563eb]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[12px] font-black text-gray-900 leading-tight mb-0.5">{coupon.name}</h4>
                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-wider">
                                            <Clock size={10} className="text-[#2563eb]" /> หมดอายุ {new Date(coupon.expiryDate).toLocaleDateString('th-TH')}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-200 group-hover:text-[#2563eb]" />
                                </div>
                            ))
                        ) : (
                            <div className="bg-white/50 rounded-xl border-2 border-dashed border-gray-200 py-10 flex flex-col items-center text-center px-10">
                                <Gift size={28} className="text-gray-200 mb-2" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยังไม่มีสิทธิพิเศษในขณะนี้</h4>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cars" className="mt-5 space-y-2.5">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">รายการรถของคุณ</h4>
                            <button 
                                onClick={() => setIsAddCarModalOpen(true)}
                                className="text-[9px] font-black text-[#2563eb] flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-all"
                            >
                                <Plus size={8} /> เพิ่มรถ
                            </button>
                        </div>
                        {displayMember.cars && displayMember.cars.length > 0 ? (
                            displayMember.cars.map((car: any, idx: number) => (
                                <div key={idx} className="bg-white rounded-xl p-4 shadow-lg border border-gray-50 flex items-center justify-between group hover:border-[#2563eb]/30 transition-all active:scale-95">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-[#2563eb] transition-all shadow-inner">
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-black text-gray-900 tracking-tight leading-none">{car.plate}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-gray-100 text-gray-500 border-0 text-[8px] font-black h-4 px-1.5 uppercase rounded-sm">{car.size}</Badge>
                                                <span className="text-[9px] text-gray-400 font-bold">{car.brand} {car.model}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-200 group-hover:text-[#2563eb]" />
                                </div>
                            ))
                        ) : (
                            <div className="bg-white/50 rounded-xl border-2 border-dashed border-gray-200 py-10 flex flex-col items-center text-center px-10">
                                <Car size={28} className="text-gray-200 mb-2" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยังไม่ได้ลงทะเบียนรถ</h4>
                                <Button 
                                    variant="ghost" 
                                    className="mt-3 text-[#2563eb] font-black text-[9px] uppercase tracking-widest hover:bg-blue-50 rounded-lg"
                                    onClick={() => setIsAddCarModalOpen(true)}
                                >
                                    + ลงทะเบียนรถคันแรก
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* QR Modal */}
            <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                <DialogContent className="sm:max-w-[320px] rounded-xl p-0 overflow-hidden border-0 bg-[#0a0b0a] shadow-2xl">
                    <DialogHeader className="p-0 border-0 h-0 overflow-hidden">
                        <DialogTitle>My Member QR</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 text-center flex flex-col items-center">
                        <div className="w-10 h-1 bg-gray-800 rounded-full mb-5"></div>
                        <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">My Member QR</h2>
                        <p className="text-gray-400 text-[9px] mb-6 font-bold uppercase tracking-widest">สแกนเพื่อสะสมแต้ม</p>
                        
                        <div className="bg-white p-5 rounded-lg shadow-xl shadow-[#2563eb]/20 mb-6 overflow-hidden">
                            <div className="w-40 h-40 bg-gray-50 flex items-center justify-center">
                                <QRCodeSVG 
                                    value={displayMember._id?.toString() || "no-id"} 
                                    size={160}
                                    level="H"
                                />
                            </div>
                        </div>

                        <div className="text-white font-black text-base mb-6 bg-white/5 px-4 py-2 rounded-lg border border-white/10 tracking-widest">
                            ID: {displayMember._id?.toString().slice(-8).toUpperCase() || "CAR-POINT"}
                        </div>

                        <Button 
                            className="w-full h-11 rounded-lg bg-white text-black hover:bg-gray-100 font-black text-xs"
                            onClick={() => setIsQRModalOpen(false)}
                        >
                            ปิดหน้าต่าง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* History Modal */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-0 bg-white max-h-[75vh] flex flex-col shadow-2xl">
                    <DialogHeader className="p-5 pb-2">
                        <DialogTitle className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                            <History size={18} className="text-[#2563eb]" /> ประวัติการบริการ
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar space-y-2.5">
                        {isLoadingDetails ? (
                            <div className="py-10 text-center flex flex-col items-center">
                                <div className="w-7 h-7 border-3 border-[#2563eb] border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">กำลังโหลด...</p>
                            </div>
                        ) : bookings.length > 0 ? (
                            bookings.map((b: any) => (
                                <div key={b._id} className="bg-gray-50 rounded-lg p-3.5 flex items-center gap-3 border border-gray-100 group transition-all hover:bg-white hover:shadow-md active:scale-[0.98]">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-300 border border-gray-100 group-hover:text-[#2563eb] shadow-sm shrink-0">
                                        <Receipt size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[12px] font-black text-gray-900 leading-tight">{b.serviceId?.name}</h4>
                                            <span className="text-[12px] font-black text-[#2563eb]">฿{b.price?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(b.bookingDate).toLocaleDateString('th-TH')}</span>
                                            <Badge className="bg-[#2563eb]/10 text-[#2563eb] text-[7px] border-0 h-3.5 px-1 font-black uppercase rounded-sm">{b.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center flex flex-col items-center">
                                <Receipt size={32} className="text-gray-100 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ไม่มีประวัติ</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Redeem Modal */}
            <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
                <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-0 bg-white max-h-[75vh] flex flex-col shadow-2xl">
                    <DialogHeader className="p-5 pb-2">
                        <DialogTitle className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                            <Gift size={18} className="text-orange-500" /> แลกแต้ม
                        </DialogTitle>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">คงเหลือ: <span className="text-orange-500">{displayMember.points.toLocaleString()}</span> PTS</p>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar space-y-2.5">
                        {isLoadingDetails ? (
                            <div className="py-10 text-center flex flex-col items-center">
                                <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">กำลังโหลด...</p>
                            </div>
                        ) : services.length > 0 ? (
                            services.map((s: any) => {
                                const pts = s.pointCost?.M || 0;
                                const canRedeem = displayMember.points >= pts;
                                return (
                                    <div key={s._id} className={`bg-gray-50 rounded-lg p-4 border border-transparent transition-all relative overflow-hidden group ${canRedeem ? 'hover:bg-white hover:shadow-md active:scale-95' : 'opacity-60 grayscale'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-gray-100 shrink-0">
                                                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Sparkles size={24} /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-[13px] font-black text-gray-900 leading-tight mb-1">{s.name}</h4>
                                                <Badge className={`${canRedeem ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'} border-0 px-2 py-0.5 rounded-full font-black text-[9px]`}>
                                                    {pts.toLocaleString()} PTS
                                                </Badge>
                                            </div>
                                        </div>
                                        {!canRedeem && (
                                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                                                <span className="bg-black/80 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest">แต้มไม่พอ</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center flex flex-col items-center">
                                <Gift size={32} className="text-gray-100 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ไม่มีรายการ</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Car Modal */}
            <Dialog open={isAddCarModalOpen} onOpenChange={setIsAddCarModalOpen}>
                <DialogContent className="sm:max-w-[320px] rounded-xl p-0 overflow-hidden border-0 bg-white shadow-2xl">
                    <DialogHeader className="p-5 pb-1">
                        <DialogTitle className="text-base font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                            <Plus size={16} className="text-[#2563eb]" /> ลงทะเบียนรถใหม่
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="px-5 pb-6 space-y-3.5">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">เลขทะเบียนรถ</label>
                            <input 
                                className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                placeholder="เช่น กข 1234"
                                value={carForm.plate}
                                onChange={e => setCarForm({...carForm, plate: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ยี่ห้อ</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="Toyota"
                                    value={carForm.brand}
                                    onChange={e => setCarForm({...carForm, brand: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">รุ่น</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="Camry"
                                    value={carForm.model}
                                    onChange={e => setCarForm({...carForm, model: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ขนาดรถ</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {['S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setCarForm({...carForm, size})}
                                        className={`h-10 rounded-lg text-[9px] font-black transition-all ${carForm.size === size ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button 
                            className="w-full h-10 rounded-lg bg-[#0a0b0a] text-white font-black text-xs mt-1.5 shadow-md active:scale-95 transition-all"
                            onClick={handleAddCar}
                            disabled={isSubmittingCar || !carForm.plate}
                        >
                            {isSubmittingCar ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียน"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default function MemberProfile() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0b0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin shadow-2xl"></div>
            </div>
        }>
            <MemberProfileContent />
        </Suspense>
    );
}
