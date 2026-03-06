"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Settings as SettingsIcon, Save, Info,
    Coins, Percent, AlertTriangle, CheckCircle,
    Loader2, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: any) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: Number(value) })
            });
            if (res.ok) {
                setMessage("บันทึกการตั้งค่าสำเร็จ!");
                setTimeout(() => setMessage(""), 3000);
                await fetchSettings();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <header className="flex justify-between items-center mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#bbfc2f] rounded-3xl flex items-center justify-center shadow-xl shadow-[#bbfc2f]/20">
                            <SettingsIcon size={32} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ตั้งค่าระบบ (Settings)</h1>
                            <p className="text-muted-foreground text-sm font-medium">กำหนดอัตราการแจกแต้ม และนโยบายการแลกคะแนนสะสม</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl space-y-8 pb-20">
                    <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden p-8">
                        <CardHeader className="p-0 mb-8 border-b border-gray-50 pb-6 flex flex-row items-center gap-4">
                            <div className="w-12 h-12 bg-[#bbfc2f]/10 rounded-2xl flex items-center justify-center text-[#bbfc2f]">
                                <Coins size={24} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-gray-900 tracking-tight">นโยบายคะแนนสะสม (Loyalty Points)</CardTitle>
                                <p className="text-sm text-gray-400 font-medium">กำหนดว่าลูกค้าจะได้แต้มเท่าไหร่จากการจ่ายเงินจริง</p>
                            </div>
                        </CardHeader>

                        <div className="space-y-10">
                            {settings.map((s) => (
                                <div key={s.key} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-lg font-black text-gray-900">{s.key === 'point_earn_rate' ? 'อัตราการให้แต้ม' : 'คะแนนขั้นต่ำในการแลก'}</Label>
                                            <Info size={14} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed">{s.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                className="w-full md:w-32 h-14 rounded-2xl bg-gray-50 border-none font-bold text-xl px-4 text-center group-focus-within:bg-[#bbfc2f]/5"
                                                defaultValue={s.value}
                                                step={s.key === 'point_earn_rate' ? 0.01 : 1}
                                                onBlur={(e) => handleUpdate(s.key, e.target.value)}
                                            />
                                            {s.key === 'point_earn_rate' && (
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#bbfc2f] bg-black px-2 py-0.5 rounded-full">
                                                    {(s.value * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-0 shadow-sm bg-[#111311] overflow-hidden p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Zap size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black text-[#bbfc2f]">💡 เคล็ดลับการตั้งค่า</h3>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-400 font-medium">1. **Point Earn Rate**: หากตั้งเป็น 0.1 หมายถึง จ่าย 100 บาท จะได้ 10 แต้ม (10%)</p>
                                <p className="text-sm text-gray-400 font-medium">2. **การแลกแต้ม**: คุณสามารถเข้าไปกำหนด "คะแนนที่ต้องใช้" ได้ในหน้าจัดการบริการของแต่ละตัว</p>
                                <p className="text-sm text-gray-400 font-medium">3. **กลยุทธ์**: แนะนำให้ตั้งแต้มสะสมประมาณ 5-10% เพื่อกระตุ้นให้ลูกค้ากลับมาใช้ซ้ำ</p>
                            </div>
                        </div>
                    </Card>

                    {message && (
                        <div className="fixed bottom-10 right-10 flex items-center gap-3 bg-white px-8 py-5 rounded-[2rem] shadow-2xl border-l-8 border-[#bbfc2f] animate-in slide-in-from-right duration-500">
                            <CheckCircle className="text-[#bbfc2f]" size={24} />
                            <span className="font-black text-gray-900">{message}</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
