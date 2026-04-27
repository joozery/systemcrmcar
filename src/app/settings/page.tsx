"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Settings as SettingsIcon, Save, Info,
    Coins, Target, Zap, CheckCircle2,
    Trophy, Crown, Star, ArrowRight,
    Search, Bell, User, Gift, Sparkles, Plus, Trash2, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [localPackages, setLocalPackages] = useState<any[]>([]);
    const [localPrivileges, setLocalPrivileges] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
            
            const pkgs = data.find((s: any) => s.key === 'global_packages')?.value || [];
            const privs = data.find((s: any) => s.key === 'global_privileges')?.value || [];
            setLocalPackages(pkgs);
            setLocalPrivileges(privs);
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
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                setMessage("บันทึกการตั้งค่าเรียบร้อยแล้ว ✨");
                setTimeout(() => setMessage(""), 3000);
                await fetchSettings();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocalArrayUpdate = (type: 'pkg' | 'priv', index: number, field: string, value: any) => {
        if (type === 'pkg') {
            const newArr = [...localPackages];
            newArr[index] = { ...newArr[index], [field]: value };
            setLocalPackages(newArr);
        } else {
            const newArr = [...localPrivileges];
            newArr[index] = { ...newArr[index], [field]: value };
            setLocalPrivileges(newArr);
        }
    };

    const handleLocalArrayAdd = (type: 'pkg' | 'priv') => {
        if (type === 'pkg') {
            setLocalPackages([...localPackages, { name: '', totalWashes: 10 }]);
        } else {
            setLocalPrivileges([...localPrivileges, { name: '', expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] }]);
        }
    };

    const handleLocalArrayDelete = (type: 'pkg' | 'priv', index: number) => {
        if (type === 'pkg') {
            setLocalPackages(localPackages.filter((_, i) => i !== index));
        } else {
            setLocalPrivileges(localPrivileges.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-sans w-full text-slate-900">
            <SidebarLeft />

            <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Top Navigation Bar */}
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 font-medium">แดชบอร์ด</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">ตั้งค่าระบบ</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="ค้นหาการตั้งค่า..." 
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 font-medium"
                            />
                        </div>
                        <button className="relative text-slate-400 hover:text-indigo-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={18} />
                        </div>
                    </div>
                </header>

                <div className="px-8 pt-8 max-w-6xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">การตั้งค่าระบบ (Configuration)</h1>
                        <p className="text-slate-500 font-medium mt-1">จัดการนโยบายคะแนนสะสม ระดับสมาชิก และกฎเกณฑ์ต่างๆ ของระบบ</p>
                    </div>

                    {/* Point Policy Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Coins size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">นโยบายคะแนนสะสม</h2>
                        </div>

                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                {settings.filter(s => s.key.startsWith('point_')).map((s, idx, arr) => (
                                    <div 
                                        key={s.key} 
                                        className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                                    >
                                        <div className="space-y-1 max-w-xl">
                                            <Label className="text-base font-bold text-slate-900">
                                                {s.key === 'point_earn_rate' ? 'อัตราการแจกแต้มสะสม' : 'จำนวนแต้มขั้นต่ำในการแลกบริการ'}
                                            </Label>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                {s.key === 'point_earn_rate' 
                                                    ? 'กำหนดสัดส่วนคะแนนที่ลูกค้าจะได้รับจากยอดชำระเงินจริง (เช่น 0.1 = ได้แต้ม 10% ของยอดจ่าย)' 
                                                    : 'กำหนดคะแนนสะสมขั้นต่ำที่ลูกค้าต้องมีเพื่อใช้แลกรับบริการฟรี'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative group">
                                                    <Input
                                                        id={`input-${s.key}`}
                                                        type="number"
                                                        className="w-32 h-11 bg-white border-slate-200 rounded-lg font-bold text-center focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                                        defaultValue={s.value}
                                                        step={s.key === 'point_earn_rate' ? 0.01 : 1}
                                                    />
                                                    {s.key === 'point_earn_rate' && (
                                                        <div className="absolute -top-3 -right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md z-10">
                                                            {(s.value * 100).toFixed(0)}%
                                                        </div>
                                                    )}
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-5 rounded-lg font-bold shadow-md shadow-indigo-100"
                                                    onClick={() => {
                                                        const val = (document.getElementById(`input-${s.key}`) as HTMLInputElement).value;
                                                        handleUpdate(s.key, Number(val));
                                                    }}
                                                >
                                                    <Save size={16} className="mr-2" /> บันทึก
                                                </Button>
                                            </div>
                                            <div className="px-3 py-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:block">
                                                {s.key === 'point_earn_rate' ? 'Multiplier' : 'Points'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Membership Tiers Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <Crown size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">ระดับสมาชิก (Membership Tiers)</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {settings.filter(s => s.key.startsWith('tier_')).map((s) => {
                                const tier = s.key.split('_')[1];
                                const iconMap: any = {
                                    silver: { label: 'Silver Level', icon: Star, color: 'bg-slate-100 text-slate-500', shadow: 'shadow-slate-100' },
                                    gold: { label: 'Gold Level', icon: Trophy, color: 'bg-amber-100 text-amber-600', shadow: 'shadow-amber-100' },
                                    platinum: { label: 'Platinum Level', icon: Crown, color: 'bg-indigo-100 text-indigo-600', shadow: 'shadow-indigo-100' }
                                };
                                const config = iconMap[tier] || iconMap.silver;
                                const Icon = config.icon;

                                return (
                                    <Card key={s.key} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                        <CardHeader className="space-y-4">
                                            <div className={`w-12 h-12 ${config.color} rounded-2xl flex items-center justify-center shadow-lg ${config.shadow} group-hover:scale-110 transition-transform`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black tracking-tight">{config.label}</CardTitle>
                                                <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">เกณฑ์ยอดใช้จ่ายสะสม</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Input
                                                        id={`tier-input-${s.key}`}
                                                        type="number"
                                                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black text-lg text-center focus:bg-white focus:ring-indigo-500 transition-all"
                                                        defaultValue={s.value}
                                                    />
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <span className="text-slate-300 font-bold">฿</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    className={`w-full ${tier === 'platinum' ? 'bg-indigo-600 hover:bg-indigo-700' : tier === 'gold' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-800'} text-white rounded-xl h-11 font-bold shadow-lg shadow-indigo-100`}
                                                    onClick={() => {
                                                        const val = (document.getElementById(`tier-input-${s.key}`) as HTMLInputElement).value;
                                                        handleUpdate(s.key, Number(val));
                                                    }}
                                                >
                                                    <Save size={16} className="mr-2" /> บันทึก {config.label}
                                                </Button>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic text-center">
                                                    {s.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Global Privileges & Packages Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Global Privileges */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-pink-200">
                                        <Gift size={16} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-800">สิทธิพิเศษส่วนกลาง (Privileges)</h2>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
                                    onClick={() => handleLocalArrayAdd('priv')}
                                >
                                    <Plus size={16} className="mr-1" /> เพิ่ม
                                </Button>
                            </div>
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardContent className="p-4 space-y-4">
                                    {localPrivileges.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 text-sm font-medium">ยังไม่มีสิทธิพิเศษส่วนกลาง</div>
                                    )}
                                    {localPrivileges.map((priv: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 relative group">
                                            <button 
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                onClick={() => handleLocalArrayDelete('priv', idx)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="grid grid-cols-1 gap-3">
                                                <Input 
                                                    placeholder="ชื่อสิทธิพิเศษ"
                                                    value={priv.name}
                                                    onChange={e => handleLocalArrayUpdate('priv', idx, 'name', e.target.value)}
                                                    className="h-9 font-bold bg-white"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input 
                                                        type="date"
                                                        value={priv.expiryDate ? new Date(priv.expiryDate).toISOString().split('T')[0] : ''}
                                                        onChange={e => handleLocalArrayUpdate('priv', idx, 'expiryDate', e.target.value)}
                                                        className="h-9 bg-white text-xs"
                                                    />
                                                    <div className="text-[10px] text-pink-600 font-bold flex items-center justify-center bg-white rounded-lg border border-pink-100 uppercase tracking-widest">
                                                        Active for All
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {localPrivileges.length > 0 && (
                                        <Button 
                                            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl h-10 font-bold shadow-md"
                                            onClick={() => handleUpdate('global_privileges', localPrivileges)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Save className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                            บันทึกสิทธิพิเศษ
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Global Packages */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                        <Package size={16} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-800">แพ็กเกจส่วนกลาง (Packages)</h2>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleLocalArrayAdd('pkg')}
                                >
                                    <Plus size={16} className="mr-1" /> เพิ่ม
                                </Button>
                            </div>
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardContent className="p-4 space-y-4">
                                    {localPackages.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 text-sm font-medium">ยังไม่มีแพ็กเกจส่วนกลาง</div>
                                    )}
                                    {localPackages.map((pkg: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 relative group">
                                            <button 
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                onClick={() => handleLocalArrayDelete('pkg', idx)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <div className="grid grid-cols-1 gap-3">
                                                <Input 
                                                    placeholder="ชื่อแพ็กเกจ"
                                                    value={pkg.name}
                                                    onChange={e => handleLocalArrayUpdate('pkg', idx, 'name', e.target.value)}
                                                    className="h-9 font-bold bg-white"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-[10px] font-black text-slate-400 shrink-0">Washes:</Label>
                                                        <Input 
                                                            type="number"
                                                            value={pkg.totalWashes}
                                                            onChange={e => handleLocalArrayUpdate('pkg', idx, 'totalWashes', Number(e.target.value))}
                                                            className="h-9 bg-white text-center font-bold text-xs"
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-orange-600 font-bold flex items-center justify-center bg-white rounded-lg border border-orange-100 uppercase tracking-widest">
                                                        Global Offer
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {localPackages.length > 0 && (
                                        <Button 
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 font-bold shadow-md"
                                            onClick={() => handleUpdate('global_packages', localPackages)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Save className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                            บันทึกแพ็กเกจ
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Pro Tips / Information Card */}
                    <Card className="bg-slate-900 border-0 shadow-xl rounded-2xl overflow-hidden text-white relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Zap size={160} />
                        </div>
                        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Zap size={24} className="text-amber-400" />
                                    เคล็ดลับการตั้งค่าระบบ
                                </h3>
                                <div className="space-y-2 text-slate-400 font-medium text-sm">
                                    <p className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        ควรรักษาสัดส่วนการแจกแต้ม (Point Rate) อยู่ที่ 5-10% เพื่อกระตุ้นให้ลูกค้าอยากกลับมาใช้ซ้ำ
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        การตั้งเกณฑ์ระดับ Platinum ให้สูงกว่าระดับอื่น จะช่วยสร้างความรู้สึกพิเศษ (Exclusive) ให้กับลูกค้ากลุ่ม VIP
                                    </p>
                                </div>
                            </div>
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-indigo-900/40">
                                ดูรายงานวิเคราะห์ระบบ
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Success Toast */}
                {message && (
                    <div className="fixed bottom-10 right-10 flex items-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-50">
                        <CheckCircle2 size={20} />
                        <span className="font-bold text-sm">{message}</span>
                    </div>
                )}
            </main>
        </div>
    );
}
