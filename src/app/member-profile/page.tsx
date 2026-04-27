"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
    User, Award, Gift, History, 
    QrCode, ChevronRight, Star, 
    Clock, Car, Zap, ShieldCheck, Plus,
    X, Sparkles, MapPin, Receipt,
    Info, CreditCard, ChevronLeft, Calendar,
    Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';
import liff from "@line/liff";


function MemberProfileContent() {
    const searchParams = useSearchParams();
    const urlId = searchParams.get("id");
    const [lineId, setLineId] = useState<string | null>(urlId);
    const [member, setMember] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const [tierSettings, setTierSettings] = useState({
        silver: 10000,
        gold: 30000,
        platinum: 100000
    });
    const [globalPackages, setGlobalPackages] = useState<any[]>([]);
    const [globalPrivileges, setGlobalPrivileges] = useState<any[]>([]);
    
    // Initialize LIFF
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    const settings: any = {};
                    data.forEach((s: any) => {
                        if (s.key === 'tier_silver_threshold') settings.silver = s.value;
                        if (s.key === 'tier_gold_threshold') settings.gold = s.value;
                        if (s.key === 'tier_platinum_threshold') settings.platinum = s.value;
                    });
                    const globalPkgs = data.find((s: any) => s.key === 'global_packages')?.value || [];
                    const globalPrivs = data.find((s: any) => s.key === 'global_privileges')?.value || [];
                    setGlobalPackages(globalPkgs);
                    setGlobalPrivileges(globalPrivs);
                    setTierSettings(settings);
                }
            } catch (err) {
                console.error("Failed to fetch tier settings", err);
            }
        };
        fetchSettings();

        const initLiff = async () => {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (!liffId) return;

            try {
                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setLineId(profile.userId);
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
    
    const handleRedeem = async (service: any) => {
        if (isRedeeming) return;
        
        const pts = service.priceType === 'fixed' 
            ? (service.pointCost?.S || 0)
            : (service.pointCost?.M || 0);

        if (member.points < pts) {
            alert("แต้มสะสมไม่เพียงพอ");
            return;
        }

        if (!confirm(`ยืนยันการใช้ ${pts} แต้ม เพื่อแลก "${service.name}" ใช่หรือไม่?`)) {
            return;
        }

        setIsRedeeming(true);
        try {
            const res = await fetch('/api/member/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: member._id,
                    serviceId: service._id,
                    size: 'M' // Default size for redemption
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert("แลกรับรางวัลสำเร็จ! ตรวจสอบคูปองได้ที่แถบสิทธิพิเศษ");
                setIsRedeemModalOpen(false);
                // Refresh member data
                fetchMemberData(urlId || lineId!);
            } else {
                const err = await res.json();
                alert(err.error || "เกิดข้อผิดพลาดในการแลกแต้ม");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsRedeeming(false);
        }
    };

    const fetchMemberData = async (idOrLineId: string) => {
        try {
            // Try fetching by ID first (since that's what urlId would be)
            const res = await fetch(`/api/customers/${idOrLineId}`);
            if (res.ok) {
                const data = await res.json();
                setMember(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Modals
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);

    // Add Car Form
    const [carForm, setCarForm] = useState({
        plateLetters: "",
        plateNumber: "",
        province: "",
        brand: "",
        model: "",
        color: "",
        year: "",
        size: "M"
    });
    const [isSubmittingCar, setIsSubmittingCar] = useState(false);

    const fetchMember = async () => {
        if (!lineId) {
            // Only stop loading if we're not waiting for LIFF
            if (urlId || !process.env.NEXT_PUBLIC_LIFF_ID) {
                setIsLoading(false);
            }
            return;
        }
        try {
            const res = await fetch(`/api/customers/${lineId}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isRegistered) {
                    window.location.href = `/register-member?uid=${lineId}`;
                    return;
                }
                setMember(data);
            } else if (res.status === 404) {
                window.location.href = `/register-member?uid=${lineId}`;
                return;
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
        if (!carForm.plateLetters || !carForm.plateNumber) return;
        setIsSubmittingCar(true);
        try {
            const newCar = {
                plate: `${carForm.plateLetters} ${carForm.plateNumber}`.trim(),
                province: carForm.province,
                brand: carForm.brand,
                model: carForm.model,
                color: carForm.color,
                year: carForm.year,
                size: carForm.size
            };
            const updatedCars = [...(member.cars || []), newCar];
            const res = await fetch(`/api/customers/${member._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cars: updatedCars })
            });
            if (res.ok) {
                await fetchMember();
                setIsAddCarModalOpen(false);
                setCarForm({ plateLetters: "", plateNumber: "", province: "", brand: "", model: "", color: "", year: "", size: "M" });
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
        totalSpent: 0,
        phone: "0838346686",
        cars: [],
        coupons: []
    };

    const getTier = (spent: number) => {
        if (spent >= tierSettings.platinum) return { name: "Platinum", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", icon: <Zap size={14} />, gradient: "from-cyan-500 to-blue-600" };
        if (spent >= tierSettings.gold) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: <Star size={14} />, gradient: "from-yellow-500 to-orange-600" };
        return { name: "Silver", color: "text-[#2563eb]", bg: "bg-[#2563eb]/10", border: "border-[#2563eb]/20", icon: <ShieldCheck size={14} />, gradient: "from-[#2563eb] to-[#1d4ed8]" };
    };

    const tier = getTier(displayMember.totalSpent || 0);
    let nextTierPoints = tierSettings.silver;
    if (displayMember.totalSpent >= tierSettings.gold) {
        nextTierPoints = tierSettings.platinum;
    } else if (displayMember.totalSpent >= tierSettings.silver) {
        nextTierPoints = tierSettings.gold;
    }
    const progress = Math.min(((displayMember.totalSpent || 0) / nextTierPoints) * 100, 100);

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
                            <span className="text-[11px] font-black text-gray-900">ขาดอีก {Math.max(0, nextTierPoints - (displayMember.totalSpent || 0)).toLocaleString()} บาท</span>
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
                        <TabsTrigger value="packages" className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-wider data-[state=active]:bg-[#0a0b0a] data-[state=active]:text-white transition-all">
                            แพ็กเกจ
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="coupons" className="mt-5 space-y-2.5">
                        <div className="px-1 mb-1.5">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">สิทธิพิเศษสำหรับคุณ</h4>
                        </div>
                        {/* Global Privileges */}
                        {globalPrivileges.map((coupon: any, idx: number) => (
                            <div key={`global-${idx}`} className="bg-white rounded-xl p-5 shadow-lg border border-pink-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-pink-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="relative flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Badge className="bg-pink-100 text-pink-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 px-1.5">Global Offer</Badge>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} className="text-pink-400" /> {new Date(coupon.expiryDate).toLocaleDateString('th-TH')}
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 leading-tight mb-1">{coupon.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{coupon.description || 'สิทธิพิเศษพิเศษสำหรับสมาชิกทุกคน'}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-100 shrink-0">
                                        <Gift size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Individual Coupons */}
                        {displayMember.coupons && displayMember.coupons.filter((c: any) => !c.isUsed).map((coupon: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-xl p-5 shadow-lg border border-blue-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="relative flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Badge className="bg-blue-100 text-blue-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 px-1.5">Personal Coupon</Badge>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} className="text-[#2563eb]" /> {new Date(coupon.expiryDate).toLocaleDateString('th-TH')}
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 leading-tight mb-1">{coupon.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">CODE: <span className="text-blue-600 font-bold">{coupon.code}</span></p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                                        <Award size={24} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {globalPrivileges.length === 0 && (!displayMember.coupons || displayMember.coupons.filter((c: any) => !c.isUsed).length === 0) && (
                            <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">ยังไม่มีสิทธิพิเศษใหม่ๆ</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="packages" className="mt-5 space-y-2.5">
                        <div className="px-1 mb-1.5">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">แพ็กเกจส่วนกลาง</h4>
                        </div>
                        {/* Global Packages */}
                        {globalPackages.map((pkg: any, idx: number) => (
                            <div key={`global-pkg-${idx}`} className="bg-white rounded-xl p-5 shadow-lg border border-orange-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className="bg-orange-100 text-orange-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 px-1.5">Service Package</Badge>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 leading-tight">{pkg.name}</h3>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Special Package for Members</div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="text-xl font-black text-orange-600 leading-none">{pkg.totalWashes}</div>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Sessions</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                                            <span className="text-gray-400">Availability</span>
                                            <span className="text-gray-900">100%</span>
                                        </div>
                                        <Progress value={100} className="h-1 bg-gray-100" />
                                    </div>
                                    <Sparkles size={16} className="text-orange-300" />
                                </div>
                            </div>
                        ))}

                        {/* Individual Packages */}
                        {displayMember.packages && displayMember.packages.filter((p: any) => p.status === 'active').map((pkg: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-xl p-5 shadow-lg border border-blue-50 relative overflow-hidden group mt-3">
                                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className="bg-blue-100 text-blue-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 px-1.5">Personal Package</Badge>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 leading-tight">{pkg.name}</h3>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Remaining uses</div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="text-xl font-black text-[#2563eb] leading-none">{pkg.remainingWashes}</div>
                                        <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1">Sessions Left</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1.5">
                                            <span className="text-gray-400">Usage Progress</span>
                                            <span className="text-gray-900">{pkg.totalWashes - pkg.remainingWashes} / {pkg.totalWashes}</span>
                                        </div>
                                        <Progress value={(pkg.remainingWashes / pkg.totalWashes) * 100} className="h-1.5 bg-blue-50 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {globalPackages.length === 0 && (!displayMember.packages || !displayMember.packages.some((p: any) => p.status === 'active')) && (
                            <div className="bg-white/50 rounded-xl border-2 border-dashed border-gray-200 py-10 flex flex-col items-center text-center px-10">
                                <Sparkles size={28} className="text-gray-200 mb-2" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยังไม่มีแพ็กเกจในขณะนี้</h4>
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
                                            <div className="flex flex-col mt-1">
                                                <span className="text-[9px] text-gray-400 font-bold">{car.brand} {car.model} {car.year ? `(${car.year})` : ''} • {car.color}</span>
                                                <span className="text-[8px] text-[#2563eb] font-black uppercase tracking-wider">{car.province}</span>
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
                        <DialogDescription>แสดงคิวอาร์โค้ดส่วนตัวของคุณเพื่อสะสมแต้ม</DialogDescription>
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
                        <DialogDescription className="hidden">ดูประวัติการเข้ารับบริการที่ผ่านมาของคุณ</DialogDescription>
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
                        <DialogDescription className="hidden">ใช้แต้มสะสมของคุณเพื่อแลกรับรางวัลและบริการฟรี</DialogDescription>
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
                                const pts = s.priceType === 'fixed' 
                                    ? (s.pointCost?.S || 0)
                                    : (s.pointCost?.M || 0);
                                const canRedeem = displayMember.points >= pts;
                                return (
                                    <div 
                                        key={s._id} 
                                        onClick={() => canRedeem && handleRedeem(s)}
                                        className={`bg-gray-50 rounded-lg p-4 border border-transparent transition-all relative overflow-hidden group ${canRedeem ? 'hover:bg-white hover:shadow-md active:scale-95 cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-gray-100 shrink-0">
                                                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Sparkles size={24} /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-[13px] font-black text-gray-900 leading-tight mb-1">{s.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <Badge className={`${canRedeem ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'} border-0 px-2 py-0.5 rounded-full font-black text-[9px]`}>
                                                        {pts.toLocaleString()} PTS
                                                    </Badge>
                                                    {canRedeem && (
                                                        <span className="text-[10px] font-black text-orange-500 group-hover:underline">คลิกเพื่อแลก →</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!canRedeem && (
                                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                                                <span className="bg-black/80 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest">แต้มไม่พอ</span>
                                            </div>
                                        )}
                                        {isRedeeming && canRedeem && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-20">
                                                <Loader2 className="animate-spin text-orange-500" size={20} />
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
                        <DialogDescription className="hidden">เพิ่มข้อมูลรถคันใหม่ของคุณเข้าสู่ระบบสมาชิก</DialogDescription>
                    </DialogHeader>
                    
                    <div className="px-5 pb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ยี่ห้อรถ</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="เช่น Toyota"
                                    value={carForm.brand}
                                    onChange={e => setCarForm({...carForm, brand: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">รุ่นรถ</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="เช่น Camry"
                                    value={carForm.model}
                                    onChange={e => setCarForm({...carForm, model: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">สีรถ</label>
                            <input 
                                className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                placeholder="เช่น ขาว"
                                value={carForm.color}
                                onChange={e => setCarForm({...carForm, color: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ปีรถ</label>
                            <input 
                                className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                placeholder="เช่น 2023"
                                value={carForm.year}
                                onChange={e => setCarForm({...carForm, year: e.target.value})}
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ขนาดรถ (Car Size)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setCarForm({ ...carForm, size })}
                                        className={`h-10 rounded-xl font-black text-xs transition-all border ${
                                            carForm.size === size 
                                            ? 'bg-[#0a0b0a] text-white border-transparent shadow-lg' 
                                            : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-gray-50">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">ตัวอักษร</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-1 text-xs font-bold text-center focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="กข"
                                    value={carForm.plateLetters}
                                    onChange={e => setCarForm({...carForm, plateLetters: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">หมายเลขทะเบียน</label>
                                <input 
                                    className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                    placeholder="1234"
                                    type="number"
                                    value={carForm.plateNumber}
                                    onChange={e => setCarForm({...carForm, plateNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">จังหวัด</label>
                            <input 
                                className="w-full h-10 rounded-lg bg-gray-50 border-none px-3.5 text-xs font-bold focus:ring-1 focus:ring-[#2563eb] transition-all"
                                placeholder="เช่น กรุงเทพฯ"
                                value={carForm.province}
                                onChange={e => setCarForm({...carForm, province: e.target.value})}
                            />
                        </div>

                        <Button 
                            className="w-full h-11 rounded-lg bg-[#0a0b0a] text-white font-black text-xs mt-2 shadow-md active:scale-95 transition-all"
                            onClick={handleAddCar}
                            disabled={isSubmittingCar || !carForm.plateLetters || !carForm.plateNumber}
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
