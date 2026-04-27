"use client";

import { useEffect, useState, useRef } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Calendar, Clock, User, Sparkles, Plus,
    Search, Car, Tag, CheckCircle2, AlertCircle,
    Loader2, MoreVertical, Bell, Phone, ArrowRight,
    MapPin, ChevronRight, X, ListFilter, Coins, Info,
    Volume2, VolumeX
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
    const [categories, setCategories] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    const [filterSearch, setFilterSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const lastCountRef = useRef(0);
    const isFirstLoad = useRef(true);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterDate, filterStatus]);

    const [form, setForm] = useState({
        customerId: "",
        serviceId: "",
        carPlate: "",
        carProvince: "",
        carBrand: "",
        carModel: "",
        carColor: "",
        carYear: "",
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: "08:30",
        pickupDate: "",
        price: 0,
        deposit: 0,
        carSize: "M",
        notes: ""
    });

    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const playNotificationSound = () => {
        const audio = document.getElementById('notification-sound') as HTMLAudioElement;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const fetchData = async (isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const [bRes, cRes, catRes, sRes] = await Promise.all([
                fetch('/api/bookings'),
                fetch('/api/customers'),
                fetch('/api/categories'),
                fetch('/api/services')
            ]);

            const [bData, cData, catData, sData] = await Promise.all([
                bRes.json(),
                cRes.json(),
                catRes.json(),
                sRes.json()
            ]);

            // Check for new bookings with status 'รอดำเนินการ'
            const pendingCount = bData.filter((b: any) => b.status === 'รอดำเนินการ').length;
            
            if (!isFirstLoad.current && isSoundEnabled && pendingCount > lastCountRef.current) {
                playNotificationSound();
            }

            lastCountRef.current = pendingCount;
            isFirstLoad.current = false;

            setBookings(bData);
            setCustomers(cData);
            setCategories(catData);
            setServices(sData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Polling for new bookings every 30 seconds
        const interval = setInterval(() => {
            fetchData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [isSoundEnabled]);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const bookingDateTime = new Date(`${form.bookingDate}T${form.bookingTime}:00`);
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    bookingDate: bookingDateTime.toISOString(),
                    bookingSource: 'offline'
                })
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
            carProvince: "",
            carBrand: "",
            carModel: "",
            carColor: "",
            carYear: "",
            bookingDate: new Date().toISOString().split('T')[0],
            bookingTime: "08:30",
            pickupDate: "",
            price: 0,
            deposit: 0,
            carSize: "M",
            notes: ""
        });
        setSelectedCategoryId("");
        setCustomerSearchTerm("");
    };

    const handleServiceChange = (sid: string) => {
        const srv = services.find(s => s._id === sid);
        if (srv) {
            let price = 0;
            const cust = customers.find(c => c._id === form.customerId);
            const car = cust?.cars?.find((c: any) => c.plate === form.carPlate);
            
            if (srv.priceType === 'fixed') {
                price = srv.prices.S || 0;
            } else {
                const size = car?.size || form.carSize || 'M';
                price = srv.prices[size] || srv.prices['M'] || 0;
            }
            
            setForm({ ...form, serviceId: sid, price });
        }
    };

    const handleCustomerChange = (cid: string) => {
        const cust = customers.find(c => c._id === cid);
        if (cust) {
            let nextForm = { 
                ...form, 
                customerId: cid,
                carPlate: "",
                carProvince: "",
                carBrand: "",
                carModel: "",
                carColor: "",
                carYear: ""
            };
            
            if (cust.cars && cust.cars.length > 0) {
                const firstCar = cust.cars[0];
                nextForm.carPlate = firstCar.plate;
                nextForm.carProvince = firstCar.province || "";
                nextForm.carBrand = firstCar.brand || "";
                nextForm.carModel = firstCar.model || "";
                nextForm.carColor = firstCar.color || "";
                nextForm.carYear = firstCar.year || "";
                
                if (form.serviceId) {
                    const srv = services.find(s => s._id === form.serviceId);
                    if (srv) {
                        nextForm.carSize = firstCar.size || "M";
                        nextForm.price = srv.prices[firstCar.size] || srv.prices['M'] || 0;
                    }
                }
            }
            setForm(nextForm);
            setCustomerSearchTerm(`${cust.firstName} ${cust.lastName}`);
            setIsCustomerDropdownOpen(false);
        }
    };

    const handleCarSelect = (plate: string) => {
        if (plate === "new") {
            setForm({ 
                ...form, 
                carPlate: "", 
                carProvince: "",
                carBrand: "", 
                carModel: "", 
                carYear: "",
                carSize: "M",
                price: form.price 
            });
            return;
        }

        const cust = customers.find(c => c._id === form.customerId);
        const car = cust?.cars?.find((c: any) => c.plate === plate);
        if (car) {
            let nextPrice = form.price;
            if (form.serviceId) {
                const srv = services.find(s => s._id === form.serviceId);
                if (srv) {
                    if (srv.priceType === 'fixed') {
                        nextPrice = srv.prices.S || 0;
                    } else {
                        nextPrice = srv.prices[car.size] || srv.prices['M'] || 0;
                    }
                }
            }
            setForm({ 
                ...form, 
                carPlate: car.plate, 
                carProvince: car.province || "",
                carBrand: car.brand || "", 
                carModel: car.model || "", 
                carColor: car.color || "",
                carYear: car.year || "",
                carSize: car.size || "M",
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
                        <DialogContent className="sm:max-w-[800px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#0a0b0a] p-6 text-white relative">
                                <DialogTitle className="text-2xl font-black text-[#2563eb] tracking-tight">ทำรายการจองคิว</DialogTitle>
                                <p className="text-gray-400 text-xs font-medium">ระบุชื่อลูกค้าและบริการ เพื่อกำหนดวันนัด</p>
                            </DialogHeader>

                            <div className="max-h-[75vh] overflow-y-auto p-8 no-scrollbar bg-white">
                                <form onSubmit={handleCreateBooking} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Customer & Service */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <Label className="text-gray-600 font-bold">เลือกลูกค้า</Label>
                                                {form.customerId && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                                                        <Coins size={14} className="text-orange-500" />
                                                        <span className="text-xs font-bold text-orange-700">
                                                            {customers.find(c => c._id === form.customerId)?.points?.toLocaleString() || 0} PTS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <Input
                                                        placeholder="ค้นหาชื่อลูกค้า หรือเบอร์โทร..."
                                                        className="h-11 rounded-xl bg-gray-50 border-none px-11 text-sm font-bold"
                                                        value={customerSearchTerm}
                                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                                        onChange={(e) => {
                                                            setCustomerSearchTerm(e.target.value);
                                                            setIsCustomerDropdownOpen(true);
                                                        }}
                                                    />
                                                    {customerSearchTerm && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setCustomerSearchTerm(""); setForm({...form, customerId: ""}); }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {isCustomerDropdownOpen && customerSearchTerm.trim().length > 0 && (
                                                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[250px] overflow-y-auto no-scrollbar py-2">
                                                        {customers.filter(c => 
                                                            `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                                                            c.phone?.includes(customerSearchTerm)
                                                        ).length > 0 ? (
                                                            customers.filter(c => 
                                                                `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                                                                c.phone?.includes(customerSearchTerm)
                                                            ).map(c => (
                                                                <div 
                                                                    key={c._id}
                                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                                                                    onClick={() => handleCustomerChange(c._id)}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#2563eb] transition-colors">{c.firstName} {c.lastName}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold">{c.phone}</span>
                                                                    </div>
                                                                    {form.customerId === c._id && <CheckCircle2 size={16} className="text-[#2563eb]" />}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-4 text-center">
                                                                <p className="text-xs text-gray-400 font-bold">ไม่พบรายชื่อที่ค้นหา</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">เลือกหมวดหมู่</Label>
                                            <select
                                                className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all"
                                                value={selectedCategoryId}
                                                onChange={(e) => {
                                                    setSelectedCategoryId(e.target.value);
                                                    setForm({ ...form, serviceId: "" });
                                                }}
                                            >
                                                <option value="">เลือกหมวดหมู่</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">เลือกบริการ</Label>
                                            <select
                                                required
                                                disabled={!selectedCategoryId}
                                                className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all disabled:opacity-50"
                                                value={form.serviceId}
                                                onChange={(e) => handleServiceChange(e.target.value)}
                                            >
                                                <option value="">เลือกแพ็คเกจ</option>
                                                {services
                                                    .filter(s => s.categoryId === selectedCategoryId || s.categoryId?._id === selectedCategoryId)
                                                    .map(s => (
                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-50">
                                            <Label className="text-gray-900 font-black uppercase tracking-widest text-[10px]">ข้อมูลรถยนต์</Label>
                                            
                                            {form.customerId && customers.find(c => c._id === form.customerId)?.cars?.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] text-indigo-600 font-black uppercase tracking-tight ml-1">เลือกจากประวัติรถ</Label>
                                                    <select
                                                        className="w-full h-11 rounded-xl bg-indigo-50 border-none px-4 text-sm text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        onChange={(e) => handleCarSelect(e.target.value)}
                                                        value={form.carPlate}
                                                    >
                                                        <option value="">-- เลือกรถ --</option>
                                                        {customers.find(c => c._id === form.customerId).cars.map((car: any) => (
                                                            <option key={car.plate} value={car.plate}>
                                                                🚗 {car.plate} - {car.brand} {car.model}
                                                            </option>
                                                        ))}
                                                        <option value="new">+ เพิ่มทะเบียนใหม่</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">ทะเบียนรถ</Label>
                                                    <Input
                                                        placeholder="กข 1234"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carPlate}
                                                        onChange={e => setForm({ ...form, carPlate: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">จังหวัด</Label>
                                                    <Input
                                                        placeholder="กรุงเทพฯ"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carProvince}
                                                        onChange={e => setForm({ ...form, carProvince: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">ยี่ห้อรถ</Label>
                                                    <Input
                                                        placeholder="Toyota"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carBrand}
                                                        onChange={e => setForm({ ...form, carBrand: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">รุ่นรถ</Label>
                                                    <Input
                                                        placeholder="Camry"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carModel}
                                                        onChange={e => setForm({ ...form, carModel: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">สีรถ</Label>
                                                    <Input
                                                        placeholder="ขาว"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carColor}
                                                        onChange={e => setForm({ ...form, carColor: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-gray-400 ml-1">ปีรถ</Label>
                                                    <Input
                                                        placeholder="2023"
                                                        className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                        value={form.carYear}
                                                        onChange={e => setForm({ ...form, carYear: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-gray-50">
                                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ขนาดรถ</Label>
                                                <div className="grid grid-cols-7 gap-2">
                                                    {['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => {
                                                                const srv = services.find(srv => srv._id === form.serviceId);
                                                                let nextPrice = form.price;
                                                                if (srv && srv.priceType !== 'fixed') {
                                                                    nextPrice = srv.prices[s] || srv.prices['M'] || 0;
                                                                }
                                                                setForm({ ...form, carSize: s, price: nextPrice });
                                                            }}
                                                            className={`h-9 rounded-lg font-black text-xs transition-all border ${
                                                                form.carSize === s 
                                                                ? 'bg-[#2563eb] text-white border-blue-600 shadow-md' 
                                                                : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Time & Notes */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-600 font-bold ml-1">วันที่นัดหมาย</Label>
                                                <Input
                                                    type="date"
                                                    className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                    value={form.bookingDate}
                                                    onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-600 font-bold ml-1">เวลานัดหมาย</Label>
                                                <select
                                                    className="w-full h-11 rounded-xl bg-gray-50 border-none px-4 text-sm text-gray-900 font-bold focus:ring-2 focus:ring-[#2563eb] transition-all"
                                                    value={form.bookingTime}
                                                    onChange={e => setForm({ ...form, bookingTime: e.target.value })}
                                                >
                                                    {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"].map(t => (
                                                        <option key={t} value={t}>{t} น.</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">กำหนดรับรถ (ถ้าทราบ)</Label>
                                            <Input
                                                type="datetime-local"
                                                className="h-11 rounded-xl bg-gray-50 border-none text-sm font-bold"
                                                value={form.pickupDate}
                                                onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-600 font-bold ml-1">หมายเหตุเพิ่มเติม</Label>
                                            <textarea
                                                className="w-full h-24 rounded-xl bg-gray-50 border-none p-4 text-sm text-gray-900 focus:ring-2 focus:ring-[#2563eb] transition-all no-scrollbar"
                                                placeholder="ความต้องการพิเศษของลูกค้า หรือจุดที่ควรระวัง..."
                                                value={form.notes}
                                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-gray-50">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <Label className="text-gray-900 font-black text-sm">ราคาค่าบริการ (฿)</Label>
                                                        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">
                                                            + {Math.floor(form.price * 0.1)} Points
                                                        </p>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="h-14 rounded-xl bg-white border-2 border-[#2563eb]/20 font-black text-2xl text-[#2563eb] shadow-inner"
                                                        value={form.price}
                                                        onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <Label className="text-gray-600 font-black text-sm">เงินมัดจำ (฿)</Label>
                                                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Deposit</p>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="h-14 rounded-xl bg-orange-50 border-2 border-orange-200/50 font-black text-2xl text-orange-700 shadow-inner"
                                                        value={form.deposit}
                                                        onChange={e => setForm({ ...form, deposit: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl h-14 font-black text-lg shadow-xl shadow-[#2563eb]/20 border-0 mt-4 active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'ยืนยันการจองคิว'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                const newState = !isSoundEnabled;
                                setIsSoundEnabled(newState);
                                if (newState) {
                                    setTimeout(playNotificationSound, 100);
                                }
                            }}
                            className={`rounded-xl h-12 w-12 p-0 border-0 flex items-center justify-center transition-all ${isSoundEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}
                            title={isSoundEnabled ? "ปิดเสียงแจ้งเตือน" : "เปิดเสียงแจ้งเตือน"}
                        >
                            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </Button>
                        {isSoundEnabled && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={playNotificationSound}
                                className="text-[10px] h-8 rounded-lg border-blue-100 text-blue-600 font-bold"
                            >
                                ทดสอบเสียง
                            </Button>
                        )}
                        <audio id="notification-sound" src="/noti.wav" preload="auto"></audio>
                    </div>
                </header>

                {/* Queue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="rounded-2xl border-0 shadow-sm p-4 bg-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full" />
                        <CardHeader className="p-0 mb-1">
                            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รอดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-3xl font-black text-gray-900">{bookings.filter(b => b.status === 'รอดำเนินการ').length}</span>
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Clock size={20} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm p-4 bg-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full" />
                        <CardHeader className="p-0 mb-1">
                            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ยืนยันแล้ว</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-3xl font-black text-gray-900">{bookings.filter(b => b.status === 'ยืนยันแล้ว').length}</span>
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <CheckCircle2 size={20} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm p-4 bg-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-50 rounded-full" />
                        <CardHeader className="p-0 mb-1">
                            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">กำลังทำ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-3xl font-black text-gray-900">{bookings.filter(b => b.status === 'กำลังดำเนินการ').length}</span>
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-0 shadow-sm p-4 bg-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 rounded-full" />
                        <CardHeader className="p-0 mb-1">
                            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เสร็จสิ้นวันนี้</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex items-center justify-between relative z-10">
                            <span className="text-3xl font-black text-gray-900">{bookings.filter(b => b.status === 'เสร็จสิ้น').length}</span>
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <Sparkles size={20} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Filtering Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <Input 
                            placeholder="ค้นหาทะเบียนรถ, ชื่อลูกค้า หรือเบอร์โทร..."
                            className="pl-11 h-11 bg-slate-50 border-none rounded-xl text-sm font-bold placeholder:text-slate-300"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative shrink-0">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input 
                                type="date"
                                className="pl-10 h-11 w-[160px] bg-slate-50 border-none rounded-xl text-xs font-black"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-11 bg-slate-50 border-none rounded-xl text-xs font-black px-4 focus:ring-2 focus:ring-blue-500 transition-all min-w-[120px]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="รอดำเนินการ">รอดำเนินการ</option>
                            <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                            <option value="ยกเลิก">ยกเลิก</option>
                        </select>
                        {(filterSearch || filterDate || filterStatus !== "all") && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setFilterSearch("");
                                    setFilterDate("");
                                    setFilterStatus("all");
                                }}
                                className="h-11 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                            >
                                <X size={16} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-20">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลานัด / วันที่</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ทะเบียน / รถ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ลูกค้า / เบอร์โทร</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">บริการ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-[#2563eb] mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-400">กำลังโหลดข้อมูล...</p>
                                        </td>
                                    </tr>
                                ) : bookings.filter(b => {
                                    const matchesSearch = !filterSearch || 
                                        b.carPlate.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                        `${b.customerId?.firstName} ${b.customerId?.lastName}`.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                        b.customerId?.phone?.includes(filterSearch);
                                    const matchesDate = !filterDate || b.bookingDate.split('T')[0] === filterDate;
                                    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
                                    return matchesSearch && matchesDate && matchesStatus;
                                }).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                                            <h3 className="text-lg font-black text-slate-400">ไม่พบรายการ</h3>
                                        </td>
                                    </tr>
                                ) : (
                                    bookings
                                        .filter(b => {
                                            const matchesSearch = !filterSearch || 
                                                b.carPlate.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                                `${b.customerId?.firstName} ${b.customerId?.lastName}`.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                                b.customerId?.phone?.includes(filterSearch);
                                            const matchesDate = !filterDate || b.bookingDate.split('T')[0] === filterDate;
                                            const matchesStatus = filterStatus === "all" || b.status === filterStatus;
                                            return matchesSearch && matchesDate && matchesStatus;
                                        })
                                        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((b) => (
                                            <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-indigo-600">
                                                            {new Date(b.bookingDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })} น.
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {new Date(b.bookingDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                            <Car size={16} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-900">{b.carPlate}</span>
                                                                <Badge className="bg-slate-100 text-slate-500 border-0 h-4 text-[8px] px-1 font-black">{b.carSize}</Badge>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{b.carBrand} {b.carModel}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{b.customerId?.firstName} {b.customerId?.lastName}</span>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                            <Phone size={10} /> {b.customerId?.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-indigo-600 font-black text-sm">
                                                        <Sparkles size={14} className="shrink-0" />
                                                        <span className="truncate max-w-[150px]">{b.serviceId?.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">฿{b.price?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
                                                        b.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-700' :
                                                        b.status === 'ยืนยันแล้ว' ? 'bg-blue-100 text-blue-700' :
                                                        b.status === 'กำลังดำเนินการ' ? 'bg-indigo-100 text-indigo-700' :
                                                        b.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {b.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {b.status === 'รอดำเนินการ' ? (
                                                            <>
                                                                <Button 
                                                                    size="sm" onClick={() => updateStatus(b._id, 'ยกเลิก')}
                                                                    variant="ghost" className="h-8 w-8 p-0 rounded-full text-rose-500 hover:bg-rose-50"
                                                                >
                                                                    <X size={16} />
                                                                </Button>
                                                                <Button 
                                                                    size="sm" onClick={() => updateStatus(b._id, 'ยืนยันแล้ว')}
                                                                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-lg px-3"
                                                                >
                                                                    อนุมัติ
                                                                </Button>
                                                            </>
                                                        ) : b.status === 'ยืนยันแล้ว' ? (
                                                            <Button 
                                                                size="sm" onClick={() => updateStatus(b._id, 'กำลังดำเนินการ')}
                                                                className="h-8 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] rounded-lg px-3"
                                                            >
                                                                เริ่มงาน
                                                            </Button>
                                                        ) : b.status === 'กำลังดำเนินการ' ? (
                                                            <Button 
                                                                size="sm" onClick={() => updateStatus(b._id, 'เสร็จสิ้น')}
                                                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg px-3 flex items-center gap-1"
                                                            >
                                                                <Bell size={12} /> เสร็จงาน
                                                            </Button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-300">
                                                                {b.status === 'เสร็จสิ้น' ? '✓ สำเร็จ' : '✕ ยกเลิก'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!isLoading && bookings.length > 0 && (
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                แสดง {Math.min(bookings.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(bookings.length, currentPage * itemsPerPage)} จาก {bookings.length} รายการ
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px]"
                                >
                                    ก่อนหน้า
                                </Button>
                                {[...Array(Math.ceil(bookings.filter(b => {
                                    const matchesSearch = !filterSearch || 
                                        b.carPlate.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                        `${b.customerId?.firstName} ${b.customerId?.lastName}`.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                        b.customerId?.phone?.includes(filterSearch);
                                    const matchesDate = !filterDate || b.bookingDate.split('T')[0] === filterDate;
                                    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
                                    return matchesSearch && matchesDate && matchesStatus;
                                }).length / itemsPerPage))].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`h-8 w-8 p-0 rounded-lg font-bold text-[10px] ${currentPage === i + 1 ? "bg-[#2563eb]" : "border-slate-200"}`}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(bookings.length / itemsPerPage), prev + 1))}
                                    disabled={currentPage === Math.ceil(bookings.filter(b => {
                                        const matchesSearch = !filterSearch || 
                                            b.carPlate.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                            `${b.customerId?.firstName} ${b.customerId?.lastName}`.toLowerCase().includes(filterSearch.toLowerCase()) ||
                                            b.customerId?.phone?.includes(filterSearch);
                                        const matchesDate = !filterDate || b.bookingDate.split('T')[0] === filterDate;
                                        const matchesStatus = filterStatus === "all" || b.status === filterStatus;
                                        return matchesSearch && matchesDate && matchesStatus;
                                    }).length / itemsPerPage)}
                                    className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px]"
                                >
                                    ถัดไป
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
