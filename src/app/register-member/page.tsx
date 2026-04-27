"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, CheckCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import liff from "@line/liff";

function RegisterMemberContent() {
    const searchParams = useSearchParams();
    const urlUid = searchParams.get('uid');
    const [userId, setUserId] = useState<string | null>(urlUid);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // OTP States
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otpToken, setOtpToken] = useState('');
    const [refCode, setRefCode] = useState('');
    const [pin, setPin] = useState('');
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

    useEffect(() => {
        const initLiff = async () => {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (!liffId) {
                if (!urlUid) setError('Configuration error: LIFF ID not found');
                setIsLoading(false);
                return;
            }

            try {
                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setUserId(profile.userId);
                    checkExistingMember(profile.userId);
                } else {
                    liff.login();
                }
            } catch (err) {
                console.error("LIFF initialization failed", err);
                if (!urlUid) setError('กรุณาเข้าใช้งานผ่าน LINE');
                setIsLoading(false);
            }
        };

        if (urlUid) {
            setUserId(urlUid);
            checkExistingMember(urlUid);
        } else {
            initLiff();
        }
    }, [urlUid]);

    const checkExistingMember = async (uid: string) => {
        try {
            const res = await fetch(`/api/customers/${uid}`);
            if (res.ok) {
                const data = await res.json();
                if (data.isRegistered) {
                    setIsExisting(true);
                }
            }
        } catch (err) {
            console.error("Check member error", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!userId) return;
        
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });

            const data = await res.json();
            if (res.ok) {
                setOtpToken(data.token);
                setRefCode(data.refCode);
                setStep('otp');
            } else {
                setError(data.error || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการส่ง OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e: any) => {
        e.preventDefault();
        setIsVerifyingOTP(true);
        setError('');

        try {
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone, pin })
            });

            const data = await res.json();
            if (res.ok) {
                // OTP Success -> Proceed to Register
                await handleRegister();
            } else {
                setError(data.error || 'รหัส OTP ไม่ถูกต้อง');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการตรวจสอบ OTP');
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const handleRegister = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/members/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId: userId,
                    ...formData
                })
            });

            if (res.ok) {
                setIsDone(true);
                // Redirect to profile after 2 seconds
                setTimeout(() => {
                    window.location.href = `/member-profile?id=${userId}`;
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
                setStep('form');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการลงทะเบียน');
            setStep('form');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0b0a] flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#2563eb]" size={32} />
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Preparing...</p>
                </div>
            </div>
        );
    }

    if (isExisting) {
        return (
            <div className="min-h-screen bg-[#0a0b0a] flex flex-col font-sans">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb] rounded-full filter blur-[100px] opacity-10 -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10 max-w-xs w-full">
                        <div className="w-16 h-16 bg-[#2563eb]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-[#2563eb]/20 shadow-xl backdrop-blur-xl">
                            <ShieldCheck size={32} className="text-[#2563eb]" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">Member Found</h1>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-10">
                            เราพบข้อมูลของคุณในระบบแล้วครับ<br/>สามารถเข้าใช้งานโปรไฟล์สมาชิกได้ทันที
                        </p>
                        
                        <Button 
                            onClick={() => window.location.href = `/member-profile?id=${userId}`}
                            className="w-full bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl h-14 font-black text-sm shadow-xl shadow-[#2563eb]/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            ดูโปรไฟล์สมาชิก <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isDone) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-green-400 rounded-full filter blur-[80px] opacity-10 -mr-10 -mt-10"></div>
                    
                    <div className="relative z-10 max-w-xs w-full">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-green-100 shadow-lg">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight uppercase">Success</h1>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed mb-10">
                            ลงทะเบียนสำเร็จแล้วครับ<br/>ยินดีต้อนรับเข้าสู่ครอบครัว Pro Steam
                        </p>
                        <Button 
                            onClick={() => window.location.href = `/member-profile?id=${userId}`}
                            className="w-full bg-[#0a0b0a] text-white hover:bg-black rounded-xl h-14 font-black text-sm shadow-xl transition-all active:scale-[0.98]"
                        >
                            เริ่มใช้งานเลย
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            {/* Header Section */}
            <div className="bg-[#0a0b0a] pt-12 pb-16 px-6 rounded-b-[2rem] relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563eb] rounded-full filter blur-[100px] opacity-10 -mr-16 -mt-16"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/10">
                        <User size={28} className="text-[#2563eb]" />
                    </div>
                    <h1 className="text-2xl font-black text-white text-center tracking-tighter leading-none mb-2 uppercase">
                        Register <span className="text-[#2563eb]">Member</span>
                    </h1>
                    <p className="text-blue-400 font-bold text-[9px] uppercase tracking-[0.3em]">Pro Steam Car Detail</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="px-5 -mt-8 relative z-20 pb-12">
                <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-[1.5rem] overflow-hidden bg-white">
                    <CardContent className="p-7 pt-10">
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3.5 rounded-xl text-[10px] font-bold mb-6 border border-red-100 flex items-center gap-2">
                                <span className="shrink-0">⚠️</span> {error}
                            </div>
                        )}

                        {step === 'form' ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        ชื่อ - นามสกุล
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            required
                                            placeholder="ชื่อจริง"
                                            className="rounded-xl border-none h-12 px-4 bg-slate-50 text-xs font-bold focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                        <Input
                                            required
                                            placeholder="นามสกุล"
                                            className="rounded-xl border-none h-12 px-4 bg-slate-50 text-xs font-bold focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        เบอร์โทรศัพท์
                                    </Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <Input
                                            required
                                            type="tel"
                                            placeholder="08X-XXXXXXX"
                                            className="rounded-xl border-none h-12 pl-12 bg-slate-50 text-xs font-bold focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.1em] placeholder:text-slate-300"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !userId}
                                        className="w-full bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl h-14 font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 border-none uppercase tracking-widest"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin w-5 h-5" />
                                        ) : (
                                            'สมัครสมาชิก'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="text-center mb-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">ส่งรหัสยืนยันไปยังเบอร์ {formData.phone}</p>
                                    <p className="text-[10px] font-black text-[#2563eb] uppercase tracking-widest">Ref Code: {refCode}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        รหัส OTP (6 หลัก)
                                    </Label>
                                    <Input
                                        required
                                        maxLength={6}
                                        placeholder="Enter 6-digit PIN"
                                        className="rounded-xl border-none h-14 bg-slate-50 text-center text-xl font-black focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.5em] placeholder:text-slate-300 placeholder:tracking-normal"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>

                                <div className="pt-2 space-y-3">
                                    <Button
                                        type="submit"
                                        disabled={isVerifyingOTP || pin.length < 6}
                                        className="w-full bg-[#0a0b0a] hover:bg-black text-white rounded-xl h-14 font-black text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 border-none uppercase tracking-widest"
                                    >
                                        {isVerifyingOTP ? (
                                            <Loader2 className="animate-spin w-5 h-5" />
                                        ) : (
                                            'ยืนยันรหัส OTP'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setStep('form')}
                                        className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        ย้อนกลับไปแก้ไขเบอร์
                                    </Button>
                                </div>
                            </form>
                        )}

                        <div className="mt-10 text-center opacity-30">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em]">
                                System CRM Car Point
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RegisterMemberPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0b0a] flex items-center justify-center p-4">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        }>
            <RegisterMemberContent />
        </Suspense>
    );
}
