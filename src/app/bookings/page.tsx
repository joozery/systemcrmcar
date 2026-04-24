"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Calendar, Clock, User, Sparkles, Plus,
    Search, Car, Tag, CheckCircle2, AlertCircle,
    Loader2, MoreVertical, Bell, Phone, ArrowRight,
    MapPin, ChevronRight, X, ListFilter, Coins
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

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        customerId: "",
        serviceId: "",
        carPlate: "",
        carSize: "M",
        carBrand: "",
        carModel: "",
        bookingDate: new Date().toISOString().split('T')[0],
        pickupDate: "",
        price: 0,
        notes: ""
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [bRes, cRes, sRes] = await Promise.all([
                fetch('/api/bookings'),
                fetch('/api/customers'),
                fetch('/api/services')
            ]);

            const [bData, cData, sData] = await Promise.all([
                bRes.json(),
                cRes.json(),
                sRes.json()
            ]);

            setBookings(bData);
            setCustomers(cData);
            setServices(sData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                await fetchData();
                setIsAddModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error("Failed to create booking:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const resetForm = () => {
        setForm({
            customerId: "",
            serviceId: "",
            carPlate: "",
            carSize: "M",
            carBrand: "",
            carModel: "",
            bookingDate: new Date().toISOString().split('T')[0],
            pickupDate: "",
            price: 0,
            notes: ""
        });
    };

    const handleServiceChange = (sid: string) => {
        const srv = services.find(s => s._id === sid);
        if (srv) {
            const price = srv.prices[form.carSize] || 0;
            setForm({ ...form, serviceId: sid, price });
        }
    };

    const handleCustomerChange = (cid: string) => {
        const cust = customers.find(c => c._id === cid);
        if (cust) {
            let nextForm = { ...form, customerId: cid };
            if (cust.cars && cust.cars.length > 0) {
                nextForm.carPlate = cust.cars[0].plate;
                nextForm.carSize = cust.cars[0].size;
                
                if (form.serviceId) {
                    const srv = services.find(s => s._id === form.serviceId);
                    if (srv) {
                        nextForm.price = srv.prices[cust.cars[0].size] || 0;
                    }
                }
            }
            setForm(nextForm);
        } else {
            setForm({ ...form, customerId: cid });
        }
    };

    const handleCarSelect = (plate: string) => {
        const cust = customers.find(c => c._id === form.customerId);
        const car = cust?.cars?.find((c: any) => c.plate === plate);
        if (car) {
            let nextPrice = form.price;
            if (form.serviceId) {
                const srv = services.find(s => s._id === form.serviceId);
                if (srv) {
                    nextPrice = srv.prices[car.size] || 0;
                }
            }
            setForm({ 
                ...form, 
                carPlate: car.plate, 
                carSize: car.size, 
                carBrand: car.brand || "", 
                carModel: car.model || "", 
                price: nextPrice 
            });
        }
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-6 py-6 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2563eb] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2563eb]/10">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">ระบบจองคิวบริการ</h1>
                            <p className="text-muted-foreground text-xs font-medium">จัดการตารางคิวงาน และแจ้งเตือนลูกค้าผ่าน LINE</p>
                        </div>
                    </div>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl px-6 py-3 h-auto shadow-lg shadow-[#2563eb]/5 border-0 font-bold text-sm transition-all transform hover:scale-105 active:scale-95">
                                <Plus size={18} className="mr-2" />
                                จองคิวใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#0a0b0a] p-6 text-white relative">
                                <DialogTitle className="text-2xl font-black text-[#2563eb] tracking-tight">ทำรายการจองคิว</DialogTitle>
                                <p className="text-gray-400 text-xs font-medium">ระบุชื่อลูกค้าและบริการ เพื่อกำหนดวันนัด</p>
                            </DialogHeader>

                            <div className="max-h-[70vh] overflow-y-auto p-6 no-scrollbar">
                                <form onSubmit={handleCreateBooking} className="grid grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label className="text-gray-600 font-bold">เลือกลูกค้า</Label>
                                            {form.customerId && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                                                    <Coins size={14} className="text-orange-500" />
                                                    <span className="text-xs font-bold text-orange-700">
                                                        แต้มสะสม: {customers.find(c => c._id === form.customerId)?.points?.toLocaleString() || 0} PTS
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <select
                                            required
                                            className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all"
                                            value={form.customerId}
                                            onChange={(e) => handleCustomerChange(e.target.value)}
                                        >
                                            <option value="">เลือกสมาชิก</option>
                                            {customers.map(c => (
                                                <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-600 text-xs font-bold ml-1">เลือกบริการ</Label>
                                        <select
                                            required
                                            className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all"
                                            value={form.serviceId}
                                            onChange={(e) => handleServiceChange(e.target.value)}
                                        >
                                            <option value="">เลือกแพ็คเกจ</option>
                                            {services.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-xs font-bold ml-1">ข้อมูลรถยนต์</Label>
                                            {form.customerId && customers.find(c => c._id === form.customerId)?.cars?.length > 0 ? (
                                                <select
                                                    className="w-full h-11 rounded-xl bg-blue-50 border-none px-4 text-sm text-blue-900 font-bold focus:ring-2 focus:ring-[#2563eb] transition-all mb-2"
                                                    onChange={(e) => handleCarSelect(e.target.value)}
                                                    value={form.carPlate}
                                                >
                                                    {customers.find(c => c._id === form.customerId).cars.map((car: any) => (
                                                        <option key={car.plate} value={car.plate}>
                                                            {car.plate} - {car.brand} {car.model} ({car.size})
                                                        </option>
                                                    ))}
                                                    <option value="new">+ เพิ่มทะเบียนใหม่</option>
                                                </select>
                                            ) : null}
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb]" size={16} />
                                                    <Input
                                                        placeholder="ทะเบียนรถ"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm pl-11"
                                                        value={form.carPlate}
                                                        onChange={e => setForm({ ...form, carPlate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {['S', 'M', 'L', 'XL'].map(size => (
                                                        <button
                                                            key={size}
                                                            type="button"
                                                            onClick={() => {
                                                                const srv = services.find(s => s._id === form.serviceId);
                                                                const nextPrice = srv ? (srv.prices[size] || 0) : form.price;
                                                                setForm({ ...form, carSize: size, price: nextPrice });
                                                            }}
                                                            className={`flex-1 h-11 rounded-xl text-xs font-black transition-all ${form.carSize === size ? 'bg-[#2563eb] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    placeholder="ยี่ห้อ (เช่น Toyota)"
                                                    className="h-11 rounded-xl bg-gray-50 border-none text-sm"
                                                    value={form.carBrand}
                                                    onChange={e => setForm({ ...form, carBrand: e.target.value })}
                                                />
                                                <Input
                                                    placeholder="รุ่น (เช่น Camry)"
                                                    className="h-11 rounded-xl bg-gray-50 border-none text-sm"
                                                    value={form.carModel}
                                                    onChange={e => setForm({ ...form, carModel: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-xs font-bold ml-1">วันที่เข้ารับบริการ</Label>
                                            <Input
                                                type="date"
                                                className="h-11 rounded-xl bg-gray-50 border-none text-sm"
                                                value={form.bookingDate}
                                                onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-xs font-bold ml-1">กำหนดรับรถ</Label>
                                            <Input
                                                type="datetime-local"
                                                className="h-11 rounded-xl bg-gray-50 border-none text-sm"
                                                value={form.pickupDate}
                                                onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-600 text-xs font-bold ml-1">หมายเหตุเพิ่มเติม</Label>
                                        <textarea
                                            className="w-full h-24 rounded-xl bg-gray-50 border-none p-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all no-scrollbar"
                                            placeholder="ความต้องการพิเศษของลูกค้า หรือจุดที่ควรระวัง..."
                                            value={form.notes}
                                            onChange={e => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label className="text-gray-600 text-xs font-bold">ราคาค่าบริการ (฿)</Label>
                                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
                                                + {Math.floor(form.price * 0.1)} Points Earned
                                            </p>
                                        </div>
                                        <Input
                                            type="number"
                                            className="h-12 rounded-xl bg-white border-2 border-[#2563eb]/20 font-black text-xl text-[#2563eb]"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl h-12 font-black text-lg shadow-xl shadow-[#2563eb]/10 border-0"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'ยืนยันการจองคิว'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                    </Dialog>
                </header>

                {/* Queue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-3xl border-0 shadow-sm p-5 bg-white overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">คิวงานรอดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'รอดำเนินการ').length}</span>
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <Clock size={24} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-0 shadow-sm p-5 bg-white overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">กำลังดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'กำลังดำเนินการ').length}</span>
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-0 shadow-sm p-5 bg-white overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">เสร็จสิ้นวันนี้</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-3xl font-black text-gray-900">{bookings.filter(b => b.status === 'เสร็จสิ้น').length}</span>
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Queue List */}
                <div className="space-y-4 pb-20">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <ListFilter size={24} className="text-[#2563eb]" />
                        คิวงานทั้งหมด
                    </h2>

                    {isLoading ? (
                        <div className="py-20 text-center bg-white rounded-3xl">
                            <Loader2 className="h-10 w-10 animate-spin text-[#2563eb] mx-auto" />
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed text-gray-400 font-bold">
                            ยังไม่มีคิวงานในขณะนี้
                        </div>
                    ) : (
                        bookings.map((b) => (
                            <Card key={b._id} className="rounded-xl border-0 shadow-sm hover:shadow-md transition-all group bg-white">
                                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#2563eb]/10 group-hover:text-black transition-colors">
                                        <Car size={24} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-base text-gray-900">ทะเบียน {b.carPlate}</h3>
                                            {customers.find(c => c._id === b.customerId?._id)?.cars?.find((car: any) => car.plate === b.carPlate) && (
                                                <span className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                    {customers.find(c => c._id === b.customerId?._id).cars.find((car: any) => car.plate === b.carPlate).brand} {customers.find(c => c._id === b.customerId?._id).cars.find((car: any) => car.plate === b.carPlate).model}
                                                </span>
                                            )}
                                            <Badge className="bg-blue-50 text-[#2563eb] border-0 h-4 text-[9px] px-1.5 font-black">{b.carSize}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center text-gray-500 font-medium">
                                                <User size={12} className="mr-1 text-[#2563eb]" /> {b.customerId?.firstName} {b.customerId?.lastName}
                                            </div>
                                            <div className="flex items-center text-gray-400 font-medium">
                                                <Sparkles size={12} className="mr-1 text-orange-400" /> {b.serviceId?.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center md:items-end gap-2 shrink-0 px-6">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">นัดหมาย</div>
                                        <div className="text-lg font-black text-gray-900 leading-none">
                                            {new Date(b.bookingDate).toLocaleDateString('th-TH')}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        {b.status === 'รอดำเนินการ' && (
                                            <Button
                                                onClick={() => updateStatus(b._id, 'กำลังดำเนินการ')}
                                                className="w-full bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-xl h-10 text-xs font-bold transition-all border-0 shadow-none"
                                            >
                                                เริ่มงาน
                                            </Button>
                                        )}
                                        {b.status === 'กำลังดำเนินการ' && (
                                            <Button
                                                onClick={() => updateStatus(b._id, 'เสร็จสิ้น')}
                                                className="w-full bg-green-100 text-green-600 hover:bg-green-200 rounded-xl h-10 text-xs font-bold transition-all border-0 shadow-none"
                                            >
                                                <Bell size={12} className="mr-1.5" /> เสร็จงาน & แจ้งเตือน
                                            </Button>
                                        )}
                                        {b.status === 'เสร็จสิ้น' && (
                                            <div className="flex items-center justify-center gap-2 text-green-600 font-black text-sm">
                                                <CheckCircle2 size={16} /> เรียบร้อยแล้ว
                                            </div>
                                        )}
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
