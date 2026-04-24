"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, CheckCircle, Loader2 } from "lucide-react";

export default function RegisterMemberPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('uid');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            setError('ไม่พบรหัสผู้ใช้ไลน์ กรุณาเข้าใช้งานผ่านลิงก์ในแอปพลิเคชันไลน์เท่านั้น');
        }
    }, [userId]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

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
            } else {
                const data = await res.json();
                setError(data.error || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDone) {
        return (
            <div className="min-h-screen bg-[#f3f5f8] flex items-center justify-center p-4 font-sans">
                <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-12 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#2563eb] rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle size={48} className="text-black" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">ลงทะเบียนสำเร็จ!</h1>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            ขอบคุณสำหรับการสมัครสมาชิก คุณสามารถเริ่มสะสมแต้มและรับสิทธิพิเศษมากมายผ่าน LINE ได้ทันทีครับ
                        </p>
                        <div className="w-full bg-gray-50 text-gray-400 rounded-2xl p-4 font-medium text-sm border border-gray-100">
                            คุณสามารถกดกากบาท (X) ที่มุมบนเพื่อปิดหน้านี้ได้เลยครับ
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f5f8] flex items-center justify-center p-4 font-sans">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-[#111311] text-white p-10 pb-12 rounded-b-[3rem] relative">
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#2563eb] rounded-2xl flex items-center justify-center shadow-xl rotate-12">
                        <User size={32} className="text-black -rotate-12" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight mb-2 text-center text-[#2563eb]">
                        สมัครสมาชิก
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-center font-medium">
                        กรอกข้อมูลเพื่อรับสิทธิพิเศษและคูปอง
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-10 pt-16 mt-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 animate-pulse">
                            ❌ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-600 font-bold ml-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" /> ชื่อจริง
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb] transition-colors" size={18} />
                                <Input
                                    required
                                    placeholder="ชื่อจริงของคุณ"
                                    className="rounded-2xl border-gray-100 h-14 pl-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30 transition-all border-none shadow-sm"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-600 font-bold ml-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" /> นามสกุล
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb] transition-colors" size={18} />
                                <Input
                                    required
                                    placeholder="นามสกุลของคุณ"
                                    className="rounded-2xl border-gray-100 h-14 pl-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30 transition-all border-none shadow-sm"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-600 font-bold ml-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" /> เบอร์โทรศัพท์
                            </Label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb] transition-colors" size={18} />
                                <Input
                                    required
                                    type="tel"
                                    placeholder="08X-XXXXXXX"
                                    className="rounded-2xl border-gray-100 h-14 pl-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30 transition-all border-none shadow-sm font-mono tracking-widest"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !userId}
                            className="w-full bg-[#2563eb] text-white hover:bg-blue-700 rounded-2xl h-16 font-black text-xl shadow-lg shadow-[#2563eb]/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 mt-4 border-none"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'ยืนยันการสมัคร'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            Secure Registration Powered by System Car Point
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
