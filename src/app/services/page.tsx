"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Plus, Search, Filter, Sparkles, Clock,
    Tag, MoreVertical, Edit, Trash2,
    CheckCircle2, AlertCircle, ImageIcon, X,
    Car, ShieldCheck, Droplets, Loader2,
    Coins, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [newService, setNewService] = useState({
        name: "",
        category: "",
        description: "",
        prices: { S: 0, M: 0, L: 0, XL: 0 },
        pointCost: { S: 0, M: 0, L: 0, XL: 0 },
        redeemable: false,
        duration: "",
        status: "เปิดให้บริการ",
        image: ""
    });

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/services');
            const data = await res.json();
            if (Array.isArray(data)) {
                setServices(data);
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const filteredServices = services.filter(srv =>
        srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEditMode && editingServiceId) {
                // Update existing service
                const res = await fetch(`/api/services/${editingServiceId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...newService
                    })
                });

                if (res.ok) {
                    const updatedService = await res.json();
                    setServices(services.map(s => s.id === editingServiceId ? updatedService : s));
                    setIsAddModalOpen(false);
                    resetForm();
                }
            } else {
                // Create new service
                const nextIdNumber = services.length > 0
                    ? Math.max(...services.map(s => parseInt(s.id?.split('-')[1]) || 0)) + 1
                    : 1;
                const nextId = `SRV-${nextIdNumber.toString().padStart(3, '0')}`;

                const res = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: nextId,
                        ...newService
                    })
                });

                if (res.ok) {
                    const createdService = await res.json();
                    setServices([createdService, ...services]);
                    setIsAddModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            console.error("Failed to save service:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!confirm(`คุณต้องการลบบริการ "${name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
            } else {
                alert('ไม่สามารถลบบริการได้ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error("Failed to delete service:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (srv: any) => {
        setIsEditMode(true);
        setEditingServiceId(srv.id);
        setNewService({
            name: srv.name,
            category: srv.category,
            description: srv.description,
            prices: { ...srv.prices },
            pointCost: srv.pointCost ? { ...srv.pointCost } : { S: 0, M: 0, L: 0, XL: 0 },
            redeemable: srv.redeemable || false,
            duration: srv.duration,
            status: srv.status,
            image: srv.image
        });
        setIsAddModalOpen(true);
    };

    const resetForm = () => {
        setIsEditMode(false);
        setEditingServiceId(null);
        setNewService({
            name: "",
            category: "",
            description: "",
            prices: { S: 0, M: 0, L: 0, XL: 0 },
            pointCost: { S: 0, M: 0, L: 0, XL: 0 },
            redeemable: false,
            duration: "",
            status: "เปิดให้บริการ",
            image: ""
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewService({ ...newService, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Sparkles className="text-[#bbfc2f] fill-[#bbfc2f]/20" size={28} />
                            จัดการบริการ (Service Management)
                        </h1>
                        <p className="text-muted-foreground text-sm">ตั้งค่ารายการบริการ ราคา และระยะเวลาในการทำงาน</p>
                    </div>
                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#bbfc2f] text-black hover:bg-[#a3e635] rounded-full px-6 py-3 h-auto shadow-sm border-0 font-bold transition-all hover:scale-105 active:scale-95">
                                <Plus size={20} className="mr-2" />
                                เพิ่มบริการใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#171717] p-8 text-white relative">
                                <DialogTitle className="text-2xl font-bold">
                                    {isEditMode ? 'แก้ไขรายการบริการ' : 'เพิ่มรายการบริการใหม่'}
                                </DialogTitle>
                                <p className="text-gray-400 text-sm mt-1">
                                    {isEditMode ? 'ปรับปรุงข้อมูลบริการและราคาตามขนาดรถ' : 'กรอกข้อมูลบริการและกำหนดราคาตามขนาดรถให้ครบถ้วน'}
                                </p>
                            </DialogHeader>

                            <form onSubmit={handleAddService} className="p-8">
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Left Column: Basic Info */}
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-medium">ชื่อบริการ</Label>
                                            <Input
                                                required
                                                placeholder="เช่น ล้างรถดูดฝ่น"
                                                className="rounded-xl border-gray-200 h-12"
                                                value={newService.name}
                                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-medium">หมวดหมู่</Label>
                                            <select
                                                className="w-full h-12 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbfc2f]"
                                                value={newService.category}
                                                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                            >
                                                <option value="">เลือกหมวดหมู่</option>
                                                <option value="ล้างรถและทำความสะอาด">ล้างรถและทำความสะอาด</option>
                                                <option value="เคลือบเซรามิก">เคลือบเซรามิก</option>
                                                <option value="ฟิล์มกันรอย">ฟิล์มกันรอย</option>
                                                <option value="ปรับสภาพสีรถ">ปรับสภาพสีรถ</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-medium">รายละเอียดบริการ</Label>
                                            <textarea
                                                className="w-full rounded-xl border border-gray-200 p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#bbfc2f]"
                                                placeholder="คำอธิบายสั้นๆ เกี่ยวกับบริการนี้..."
                                                value={newService.description}
                                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-medium">ระยะเวลาทำงานโดยประมาณ</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <Input
                                                    placeholder="เช่น 1 ชั่วโมง หรือ 2-3 วัน"
                                                    className="pl-10 rounded-xl border-gray-200 h-12"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Pricing & Image */}
                                    <div className="space-y-6">
                                        <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Label className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                                                <Tag size={16} /> กำหนดราคาตามขนาดรถ (฿)
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Car Size S</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="S"
                                                        className="h-10 rounded-lg text-sm"
                                                        value={newService.prices.S}
                                                        onChange={(e) => setNewService({ ...newService, prices: { ...newService.prices, S: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Car Size M</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="M"
                                                        className="h-10 rounded-lg text-sm"
                                                        value={newService.prices.M}
                                                        onChange={(e) => setNewService({ ...newService, prices: { ...newService.prices, M: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Car Size L</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="L"
                                                        className="h-10 rounded-lg text-sm"
                                                        value={newService.prices.L}
                                                        onChange={(e) => setNewService({ ...newService, prices: { ...newService.prices, L: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Car Size XL</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="XL"
                                                        className="h-10 rounded-lg text-sm"
                                                        value={newService.prices.XL}
                                                        onChange={(e) => setNewService({ ...newService, prices: { ...newService.prices, XL: Number(e.target.value) } })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 bg-[#bbfc2f]/5 rounded-2xl border border-[#bbfc2f]/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <Label className="text-gray-700 font-bold flex items-center gap-2">
                                                    <Coins size={16} className="text-[#65a30d]" /> ใช้คะแนนแลกบริการ
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="redeemable"
                                                        className="w-4 h-4 rounded text-[#bbfc2f] accent-[#bbfc2f]"
                                                        checked={newService.redeemable}
                                                        onChange={(e) => setNewService({ ...newService, redeemable: e.target.checked })}
                                                    />
                                                    <Label htmlFor="redeemable" className="text-xs font-bold text-gray-400 cursor-pointer">เปิดระบบแลก</Label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Points S</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="PTS"
                                                        className="h-10 rounded-lg text-sm bg-white"
                                                        disabled={!newService.redeemable}
                                                        value={newService.pointCost.S}
                                                        onChange={(e) => setNewService({ ...newService, pointCost: { ...newService.pointCost, S: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Points M</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="PTS"
                                                        className="h-10 rounded-lg text-sm bg-white"
                                                        disabled={!newService.redeemable}
                                                        value={newService.pointCost.M}
                                                        onChange={(e) => setNewService({ ...newService, pointCost: { ...newService.pointCost, M: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Points L</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="PTS"
                                                        className="h-10 rounded-lg text-sm bg-white"
                                                        disabled={!newService.redeemable}
                                                        value={newService.pointCost.L}
                                                        onChange={(e) => setNewService({ ...newService, pointCost: { ...newService.pointCost, L: Number(e.target.value) } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Points XL</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="PTS"
                                                        className="h-10 rounded-lg text-sm bg-white"
                                                        disabled={!newService.redeemable}
                                                        value={newService.pointCost.XL}
                                                        onChange={(e) => setNewService({ ...newService, pointCost: { ...newService.pointCost, XL: Number(e.target.value) } })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-medium">รูปภาพประกอบ</Label>
                                            <div
                                                className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-200/30 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-gray-200/50 transition-colors"
                                            >
                                                {newService.image ? (
                                                    <>
                                                        <img src={newService.image} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); setNewService({ ...newService, image: "" }) }}
                                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <ImageIcon size={32} className="mb-2" />
                                                        <span className="text-xs">คลิกเพื่ออัปโหลดรูปภาพ</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="mt-10 gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-12 px-6" disabled={isSubmitting}>ยกเลิก</Button>
                                    <Button type="submit" className="bg-[#bbfc2f] text-black hover:bg-[#a3e635] rounded-xl h-12 px-8 font-bold border-0" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกรายการบริการ'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Filters & Stats Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-10 items-stretch lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bbfc2f] transition-colors" size={20} />
                        <Input
                            placeholder="ค้นหาชื่อบริการ หรือหมวดหมู่..."
                            className="w-full bg-white border-0 shadow-sm h-16 pl-14 pr-6 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#bbfc2f]/50 transition-all text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-white border-0 shadow-sm h-16 px-6 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold transition-all">
                            <Filter size={20} className="mr-2" />
                            ตัวกรอง
                        </Button>

                        <div className="bg-white shadow-sm rounded-2xl px-6 h-16 flex items-center gap-4 border-0 transition-all min-w-[180px]">
                            <div className="w-10 h-10 rounded-full bg-[#bbfc2f]/10 flex items-center justify-center shrink-0">
                                <Sparkles size={18} className="text-[#65a30d]" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">รายการสะสม</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-gray-900 leading-none">{services.length}</span>
                                    <span className="text-xs font-bold text-gray-500">บริการ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services List */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                    {isLoading ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] shadow-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-[#bbfc2f] mx-auto mb-4" />
                            <p className="text-gray-500">กำลังโหลดรายการบริการ...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] shadow-sm border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">ไม่พบบริการที่ค้นหา</h3>
                            <p className="text-gray-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มรายการบริการใหม่</p>
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                variant="outline"
                                className="mt-6 border-gray-200 rounded-xl"
                            >
                                <Plus size={18} className="mr-2" /> เพิ่มบริการใหม่
                            </Button>
                        </div>
                    ) : (
                        filteredServices.map((srv) => (
                            <Card key={srv.id} className="group rounded-[2.5rem] border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                                <CardContent className="p-0 flex h-full min-h-[220px]">
                                    {/* Service Image */}
                                    <div className="w-[200px] h-auto bg-gray-100 relative shrink-0 overflow-hidden">
                                        {srv.image ? (
                                            <img src={srv.image} alt={srv.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon size={48} />
                                            </div>
                                        )}
                                        <Badge className={`absolute top-4 left-4 border-0 shadow-lg ${srv.status === 'เปิดให้บริการ' ? 'bg-[#bbfc2f] text-black' : 'bg-red-500 text-white'}`}>
                                            {srv.status === 'เปิดให้บริการ' ? <CheckCircle2 size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                                            {srv.status}
                                        </Badge>
                                    </div>

                                    {/* Service Content */}
                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <Badge variant="outline" className="text-[10px] font-bold text-gray-400 mb-1 border-gray-200">
                                                    {srv.category}
                                                </Badge>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#65a30d] transition-colors">{srv.name}</h3>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600"
                                                    onClick={() => handleEditClick(srv)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500"
                                                    onClick={() => handleDeleteService(srv.id, srv.name)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                            {srv.description}
                                        </p>

                                        <div className="mt-auto">
                                            {/* Pricing List */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(srv.prices).map(([size, price]: [string, any]) => (
                                                        <div key={size} className="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100 min-w-[60px]">
                                                            <span className="text-[10px] font-bold text-gray-400">{size}</span>
                                                            <span className="text-sm font-bold text-gray-900">฿{price.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {srv.redeemable && srv.pointCost && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(srv.pointCost).map(([size, points]: [string, any]) => (
                                                            points > 0 && (
                                                                <div key={size} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-50 border border-orange-100">
                                                                    <Coins size={10} className="text-orange-500" />
                                                                    <span className="text-[10px] font-bold text-orange-700">{size}: {points.toLocaleString()} PTS</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                                    <Clock size={14} /> ระยะเวลา: {srv.duration}
                                                </span>
                                                <span className="text-xs font-mono text-gray-300">#{srv.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>


            </main>
        </div>
    );
}
