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
        if (cust && cust.cars && cust.cars.length > 0) {
            setForm({
                ...form,
                customerId: cid,
                carPlate: cust.cars[0].plate,
                carSize: cust.cars[0].size
            });
            // recalculate price based on size if service is selected
            if (form.serviceId) {
                const srv = services.find(s => s._id === form.serviceId);
                if (srv) {
                    setForm(prev => ({ ...prev, customerId: cid, carPlate: cust.cars[0].plate, carSize: cust.cars[0].size, price: srv.prices[cust.cars[0].size] || 0 }));
                }
            }
        } else {
            setForm({ ...form, customerId: cid });
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
                            <Calendar size={32} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ระบบจองคิวบริการ</h1>
                            <p className="text-muted-foreground text-sm font-medium">จัดการตารางคิวงาน เก็บแต้มสมาชิก และแจ้งเตือนลูกค้าผ่าน LINE</p>
                        </div>
                    </div>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#bbfc2f] text-black hover:bg-[#a3e635] rounded-2xl px-10 py-5 h-auto shadow-lg shadow-[#bbfc2f]/10 border-0 font-black text-lg transition-all transform hover:scale-105 active:scale-95">
                                <Plus size={24} className="mr-2" />
                                จองคิวใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[750px] rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#111311] p-10 text-white relative">
                                <DialogTitle className="text-3xl font-black text-[#bbfc2f] tracking-tight">ทำรายการจองคิวเสร็จใน 1 นาที</DialogTitle>
                                <p className="text-gray-400 font-medium">ระบุชื่อลูกค้าและบริการ เพื่อคำนวณแต้มและกำหนดวันนัด</p>
                            </DialogHeader>

                            <form onSubmit={handleCreateBooking} className="p-10 bg-white grid grid-cols-2 gap-8">
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
                                            className="w-full h-14 rounded-2xl bg-gray-50 border-none px-4 text-gray-900 focus:ring-2 focus:ring-[#bbfc2f] transition-all"
                                            value={form.customerId}
                                            onChange={(e) => handleCustomerChange(e.target.value)}
                                        >
                                            <option value="">เลือกจากรายชื่อสมาชิก</option>
                                            {customers.map(c => (
                                                <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phone})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-600 font-bold ml-1">เลือกบริการ</Label>
                                        <select
                                            required
                                            className="w-full h-14 rounded-2xl bg-gray-50 border-none px-4 text-gray-900 focus:ring-2 focus:ring-[#bbfc2f] transition-all"
                                            value={form.serviceId}
                                            onChange={(e) => handleServiceChange(e.target.value)}
                                        >
                                            <option value="">เลือกแพ็คเกจบริการ</option>
                                            {services.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">ทะเบียนรถ</Label>
                                            <Input
                                                className="h-14 rounded-2xl bg-gray-50 border-none"
                                                value={form.carPlate}
                                                onChange={e => setForm({ ...form, carPlate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">ขนาดรถ</Label>
                                            <div className="flex gap-2">
                                                {['S', 'M', 'L', 'XL'].map(size => (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, carSize: size })}
                                                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all ${form.carSize === size ? 'bg-[#bbfc2f] text-black shadow-md scale-105' : 'bg-gray-100 text-gray-400'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-600 font-bold ml-1">วันที่เข้ารับบริการ</Label>
                                        <Input
                                            type="date"
                                            className="h-14 rounded-2xl bg-gray-50 border-none"
                                            value={form.bookingDate}
                                            onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-600 font-bold ml-1">ราคาค่าบริการ (฿)</Label>
                                        <Input
                                            type="number"
                                            className="h-14 rounded-2xl bg-[#bbfc2f]/5 border-2 border-[#bbfc2f]/20 font-black text-xl"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                        />
                                        <p className="text-[10px] text-green-600 font-bold ml-1 uppercase tracking-widest">
                                            + {Math.floor(form.price * 0.1)} Points จะถูกเพิ่มให้สมาชิก
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#bbfc2f] text-black hover:bg-[#a3e635] rounded-[1.5rem] h-16 font-black text-xl shadow-xl shadow-[#bbfc2f]/20 border-0"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'ยืนยันการจองคิว'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Queue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="rounded-[2.5rem] border-0 shadow-sm p-6 bg-white overflow-hidden relative group">
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
                    <Card className="rounded-[2.5rem] border-0 shadow-sm p-6 bg-white overflow-hidden relative group">
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
                    <Card className="rounded-[2.5rem] border-0 shadow-sm p-6 bg-white overflow-hidden relative group">
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">เสร็จสิ้นวันนี้</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'เสร็จสิ้น').length}</span>
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Queue List */}
                <div className="space-y-4 pb-20">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <ListFilter size={24} className="text-[#bbfc2f]" />
                        คิวงานทั้งหมด
                    </h2>

                    {isLoading ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem]">
                            <Loader2 className="h-10 w-10 animate-spin text-[#bbfc2f] mx-auto" />
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed text-gray-400 font-bold">
                            ยังไม่มีคิวงานในขณะนี้
                        </div>
                    ) : (
                        bookings.map((b) => (
                            <Card key={b._id} className="rounded-[2rem] border-0 shadow-sm hover:shadow-md transition-all group bg-white">
                                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#bbfc2f]/10 group-hover:text-black transition-colors">
                                        <Car size={32} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">ทะเบียน {b.carPlate}</h3>
                                            <Badge className="bg-gray-100 text-gray-500 border-0 h-5 text-[10px]">{b.carSize}</Badge>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center text-gray-500 font-medium">
                                                <User size={14} className="mr-1.5" /> {b.customerId?.firstName} {b.customerId?.lastName}
                                            </div>
                                            <div className="flex items-center text-gray-400">
                                                <Sparkles size={14} className="mr-1.5 text-yellow-500" /> {b.serviceId?.name}
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
